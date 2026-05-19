// DOM Elements
const form = document.getElementById('generatorForm');
const companyInfoTypeRadios = document.querySelectorAll('input[name="companyInfoType"]');
const websiteGroup = document.getElementById('websiteGroup');
const companyTextGroup = document.getElementById('companyTextGroup');
const companyText = document.getElementById('companyText');
const wordCount = document.getElementById('wordCount');
const apiChoiceSelect = document.getElementById('apiChoice');
const claudeKeyGroup = document.getElementById('claudeKeyGroup');
const submitBtn = document.getElementById('submitBtn');
const loadingIndicator = document.getElementById('loadingIndicator');
const outputContainer = document.getElementById('outputContainer');
const emptyState = document.getElementById('emptyState');
const outputStatus = document.getElementById('outputStatus');

const docPreview = document.getElementById('docPreview');
const figmaPromptPreview = document.getElementById('figmaPromptPreview');
const claudePromptPreview = document.getElementById('claudePromptPreview');
const generationMeta = document.getElementById('generationMeta');

const downloadDocBtn = document.getElementById('downloadDocBtn');
const copyDocBtn = document.getElementById('copyDocBtn');
const copyFigmaBtn = document.getElementById('copyFigmaBtn');
const openFigmaBtn = document.getElementById('openFigmaBtn');
const copyClaudeBtn = document.getElementById('copyClaudeBtn');
const viewFullDocBtn = document.getElementById('viewFullDocBtn');
const docModal = document.getElementById('docModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const modalDocContent = document.getElementById('modalDocContent');
const loadingScreen = document.getElementById('loadingScreen');
const loadingStep = document.getElementById('loadingStep');

let generatedData = null;

// Loading steps for animation
const loadingSteps = [
  'Analyzing content...',
  'Generating document...',
  'Creating formatting...',
  'Preparing prompts...',
  'Finalizing output...'
];

let currentStep = 0;
const DEFAULT_PITCH_DECK = 'Ignite_25_pitchdeck.pdf';

// Initialize with default values
window.addEventListener('DOMContentLoaded', () => {
  const pitchDeckInput = document.getElementById('pitchDeckLink');
  if (pitchDeckInput && pitchDeckInput.value === '[Default: Ignite_25_pitchdeck.pdf loaded]') {
    console.log('📎 Default pitch deck loaded: ' + DEFAULT_PITCH_DECK);
  }
});

// Toggle company info input type
companyInfoTypeRadios.forEach(radio => {
  radio.addEventListener('change', (e) => {
    if (e.target.value === 'website') {
      websiteGroup.classList.remove('hidden');
      companyTextGroup.classList.add('hidden');
      document.getElementById('companyWebsite').removeAttribute('required');
      document.getElementById('companyText').removeAttribute('required');
    } else {
      websiteGroup.classList.add('hidden');
      companyTextGroup.classList.remove('hidden');
      document.getElementById('companyText').setAttribute('required', 'required');
    }
  });
});

// Word count tracker
companyText.addEventListener('input', () => {
  const words = companyText.value.trim().split(/\s+/).length;
  wordCount.textContent = `${Math.min(words, 10000)} / 10,000 words`;

  if (words > 10000) {
    companyText.value = companyText.value.split(/\s+/).slice(0, 10000).join(' ');
  }
});

// Toggle Claude API key input
apiChoiceSelect.addEventListener('change', (e) => {
  if (e.target.value === 'claude') {
    claudeKeyGroup.classList.remove('hidden');
    document.getElementById('claudeKey').setAttribute('required', 'required');
  } else {
    claudeKeyGroup.classList.add('hidden');
    document.getElementById('claudeKey').removeAttribute('required');
  }
});

// Form submission
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  await generateDocument();
});

async function generateDocument() {
  submitBtn.disabled = true;
  loadingScreen.classList.remove('hidden');
  outputStatus.classList.add('hidden');

  // Start loading step animation
  let stepInterval;
  currentStep = 0;
  stepInterval = setInterval(() => {
    if (currentStep < loadingSteps.length) {
      loadingStep.textContent = loadingSteps[currentStep];
      currentStep++;
    }
  }, 800);

  try {
    // Collect form data
    const formData = new FormData(form);

    // Handle file uploads
    const momFile = document.getElementById('momFile').files[0];
    let pitchDeckLink = document.getElementById('pitchDeckLink').value;

    // Use default pitch deck if not changed
    if (pitchDeckLink === '[Default: Ignite_25_pitchdeck.pdf loaded]' || !pitchDeckLink) {
      pitchDeckLink = DEFAULT_PITCH_DECK;
      console.log('📎 Using default pitch deck');
    }

    // Build request payload
    const payload = {
      title: document.getElementById('title').value,
      eventName: document.getElementById('eventName').value,
      yourOrg: document.getElementById('yourOrg').value,
      companyName: document.getElementById('companyName').value,
      companyWebsite: document.getElementById('companyWebsite').value,
      companyText: document.getElementById('companyText').value,
      momContent: '',
      pitchDeckContent: pitchDeckLink,
      additionalNotes: document.getElementById('additionalNotes').value,
      docLength: document.getElementById('docLength').value,
      tone: document.getElementById('tone').value,
      primaryColor: document.getElementById('primaryColor').value,
      secondaryColor: document.getElementById('secondaryColor').value,
      logoUrl: document.getElementById('logoUrl').value,
      fontStyle: document.getElementById('fontStyle').value,
      sections: Array.from(document.querySelectorAll('input[name="sections"]:checked')).map(el => el.value),
      designStyle: document.getElementById('designStyle').value,
      designTone: document.getElementById('designTone').value,
      mockups: Array.from(document.querySelectorAll('input[name="mockups"]:checked')).map(el => el.value),
      figmaStructure: document.getElementById('figmaStructure').value,
      apiChoice: document.getElementById('apiChoice').value,
      claudeKey: document.getElementById('claudeKey').value
    };

    // Handle MoM file upload
    if (momFile) {
      payload.momFile = momFile;
    }

    // Send to backend
    const response = await fetch('/api/generateDoc', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to generate document');
    }

    const result = await response.json();
    generatedData = result;

    // Display results
    displayResults(result);

    loadingScreen.classList.add('hidden');
    outputStatus.classList.remove('hidden');
    outputStatus.innerHTML = '✅ Document generated successfully!';
    outputStatus.style.background = 'var(--success)';

  } catch (error) {
    console.error('Error:', error);
    loadingScreen.classList.add('hidden');
    outputStatus.classList.remove('hidden');
    outputStatus.innerHTML = `❌ Error: ${error.message}`;
    outputStatus.style.background = 'var(--error)';
  } finally {
    submitBtn.disabled = false;
    clearInterval(stepInterval);
  }
}

function displayResults(data) {
  emptyState.classList.add('hidden');
  outputContainer.classList.remove('hidden');

  // Display document preview (full in panel)
  if (data.documentText) {
    // Show formatted preview in right panel
    docPreview.innerHTML = formatDocumentForDisplay(data.documentText);

    // Show buttons
    viewFullDocBtn.style.display = 'inline-block';
    downloadDocBtn.style.display = 'inline-block';
    copyDocBtn.style.display = 'inline-block';
  }

  // Display Figma prompt
  if (data.figmaPrompt) {
    figmaPromptPreview.textContent = data.figmaPrompt;
    copyFigmaBtn.style.display = 'inline-block';
    openFigmaBtn.style.display = 'inline-block';
  }

  // Display Claude prompt
  if (data.claudePrompt) {
    claudePromptPreview.textContent = data.claudePrompt;
    copyClaudeBtn.style.display = 'inline-block';
  }

  // Display metadata
  const meta = `Generated on: ${new Date().toLocaleString()} | Pages: ${document.getElementById('docLength').value} | Style: ${document.getElementById('tone').value} | Model: ${document.getElementById('apiChoice').value}`;
  generationMeta.textContent = meta;
}

// Download document
downloadDocBtn.addEventListener('click', () => {
  if (generatedData && generatedData.documentBase64) {
    const link = document.createElement('a');
    link.href = 'data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,' + generatedData.documentBase64;
    link.download = `${document.getElementById('companyName').value}_Proposal.docx`;
    link.click();
  }
});

// Copy document text
copyDocBtn.addEventListener('click', () => {
  if (generatedData && generatedData.documentText) {
    navigator.clipboard.writeText(generatedData.documentText).then(() => {
      alert('Document text copied to clipboard!');
    });
  }
});

// Copy Figma prompt
copyFigmaBtn.addEventListener('click', () => {
  if (generatedData && generatedData.figmaPrompt) {
    navigator.clipboard.writeText(generatedData.figmaPrompt).then(() => {
      alert('Figma prompt copied to clipboard!');
    });
  }
});

// Open in Figma
openFigmaBtn.addEventListener('click', () => {
  const prompt = generatedData.figmaPrompt;
  const encodedPrompt = encodeURIComponent(prompt);
  // Open Figma with plugin or instructions
  alert('Copy the Figma prompt and paste it into Figma or use the Claude Design extension in Figma');
});

// Copy Claude prompt
copyClaudeBtn.addEventListener('click', () => {
  if (generatedData && generatedData.claudePrompt) {
    navigator.clipboard.writeText(generatedData.claudePrompt).then(() => {
      alert('Claude prompt copied to clipboard!');
    });
  }
});

// View full document in modal
viewFullDocBtn.addEventListener('click', () => {
  if (generatedData && generatedData.documentText) {
    modalDocContent.innerHTML = formatDocumentForDisplay(generatedData.documentText);
    docModal.classList.remove('hidden');
  }
});

// Close modal
closeModalBtn.addEventListener('click', () => {
  docModal.classList.add('hidden');
});

// Close modal when clicking outside
docModal.addEventListener('click', (e) => {
  if (e.target === docModal) {
    docModal.classList.add('hidden');
  }
});

// Helper function to format document text as HTML
function formatDocumentForDisplay(text) {
  let html = text;

  // Convert markdown headers to HTML
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Convert bold and italic
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Convert line breaks to paragraphs
  const lines = html.split('\n');
  let inTable = false;
  let result = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('|')) {
      if (!inTable) {
        result.push('<table>');
        inTable = true;
      }

      const cells = line.split('|').filter(c => c.trim());
      const isHeader = i === 1 || lines[i - 1].includes('---');

      if (isHeader) {
        result.push('<tr>' + cells.map(c => `<th>${c.trim()}</th>`).join('') + '</tr>');
      } else if (line !== '' && !line.includes('---')) {
        result.push('<tr>' + cells.map(c => `<td>${c.trim()}</td>`).join('') + '</tr>');
      }
    } else {
      if (inTable) {
        result.push('</table>');
        inTable = false;
      }

      if (line && !line.includes('---')) {
        if (line.startsWith('<h')) {
          result.push(line);
        } else if (line) {
          result.push(`<p>${line}</p>`);
        }
      }
    }
  }

  if (inTable) {
    result.push('</table>');
  }

  return result.join('');
}
