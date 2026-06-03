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
const figmaModal = document.getElementById('figmaModal');
const closeFigmaModalBtn = document.getElementById('closeFigmaModalBtn');
const modalFigmaContent = document.getElementById('modalFigmaContent');
const claudeModal = document.getElementById('claudeModal');
const closeClaudeModalBtn = document.getElementById('closeClaudeModalBtn');
const modalClaudeContent = document.getElementById('modalClaudeContent');
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

// Cache utilities
function clearColorCache() {
  const keys = [];
  for (let key in localStorage) {
    if (key.startsWith('colorCache_')) {
      keys.push(key);
    }
  }
  keys.forEach(key => localStorage.removeItem(key));
  console.log(`✓ Cleared ${keys.length} cached color analyses`);
}

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

// Company color analysis
let colorAnalysisTimeout;
const companyNameInput = document.getElementById('companyName');
const companyWebsiteInput = document.getElementById('companyWebsite');
const primaryColorInput = document.getElementById('primaryColor');
const secondaryColorInput = document.getElementById('secondaryColor');

function triggerColorAnalysis() {
  clearTimeout(colorAnalysisTimeout);

  colorAnalysisTimeout = setTimeout(async () => {
    const companyName = companyNameInput.value.trim();
    const companyWebsite = companyWebsiteInput.value.trim();
    const companyTextValue = companyText.value.trim();

    if (companyName && (companyWebsite || companyTextValue)) {
      await analyzeCompanyColors(companyName, companyWebsite, companyTextValue);
    }
  }, 1500);
}

companyNameInput.addEventListener('blur', triggerColorAnalysis);
companyWebsiteInput.addEventListener('blur', triggerColorAnalysis);
companyText.addEventListener('blur', triggerColorAnalysis);

async function analyzeCompanyColors(companyName, companyWebsite, companyTextValue) {
  try {
    // Check browser cache first (localStorage)
    const cacheKey = `colorCache_${companyName.toLowerCase().trim()}`;
    const cachedResult = localStorage.getItem(cacheKey);

    if (cachedResult) {
      const result = JSON.parse(cachedResult);
      primaryColorInput.value = result.primaryColor;
      secondaryColorInput.value = result.secondaryColor;
      console.log(`✓ Using cached colors for ${companyName}`);
      showColorNotification(result.primaryColor, result.secondaryColor, result.reasoning + ' (cached)');
      return;
    }

    const payload = {
      companyName: companyName,
      companyWebsite: companyWebsite || undefined,
      companyText: companyTextValue || undefined
    };

    const response = await fetch('/api/analyzeCompanyColors', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.log('Color analysis failed, keeping current colors');
      return;
    }

    const result = await response.json();

    if (result.success && result.primaryColor && result.secondaryColor) {
      primaryColorInput.value = result.primaryColor;
      secondaryColorInput.value = result.secondaryColor;

      // Cache the result in browser
      try {
        localStorage.setItem(cacheKey, JSON.stringify({
          primaryColor: result.primaryColor,
          secondaryColor: result.secondaryColor,
          reasoning: result.reasoning
        }));
      } catch (e) {
        console.log('Could not cache colors (storage full)');
      }

      console.log(`🎨 Brand colors detected: Primary=${result.primaryColor}, Secondary=${result.secondaryColor}`);
      console.log(`📝 Reasoning: ${result.reasoning}`);

      showColorNotification(result.primaryColor, result.secondaryColor, result.reasoning);
    }
  } catch (error) {
    console.log('Error analyzing company colors:', error.message);
  }
}

function showColorNotification(primaryColor, secondaryColor, reasoning) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--bg-secondary);
    border: 2px solid ${primaryColor};
    border-radius: 8px;
    padding: 1rem;
    max-width: 300px;
    z-index: 999;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    animation: slideIn 0.3s ease-out;
  `;

  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
      <span style="font-size: 1.5rem;">🎨</span>
      <strong style="color: var(--text-primary);">Brand Colors Detected!</strong>
    </div>
    <div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
      <div style="width: 40px; height: 40px; background: ${primaryColor}; border-radius: 4px;"></div>
      <div style="width: 40px; height: 40px; background: ${secondaryColor}; border-radius: 4px;"></div>
    </div>
    <small style="color: var(--text-secondary); display: block;">${reasoning}</small>
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => notification.remove(), 300);
  }, 4000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

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
    viewFullFigmaBtn.style.display = 'inline-block';
    copyFigmaBtn.style.display = 'inline-block';
    openFigmaBtn.style.display = 'inline-block';
  }

  // Display Claude prompt
  if (data.claudePrompt) {
    claudePromptPreview.textContent = data.claudePrompt;
    viewFullClaudeBtn.style.display = 'inline-block';
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

// View full Figma prompt
const viewFullFigmaBtn = document.getElementById('viewFullFigmaBtn');
viewFullFigmaBtn.addEventListener('click', () => {
  if (generatedData && generatedData.figmaPrompt) {
    modalFigmaContent.textContent = generatedData.figmaPrompt;
    figmaModal.classList.remove('hidden');
  }
});

// Close Figma modal
closeFigmaModalBtn.addEventListener('click', () => {
  figmaModal.classList.add('hidden');
});

// Close Figma modal when clicking outside
figmaModal.addEventListener('click', (e) => {
  if (e.target === figmaModal) {
    figmaModal.classList.add('hidden');
  }
});

// View full Claude prompt
const viewFullClaudeBtn = document.getElementById('viewFullClaudeBtn');
viewFullClaudeBtn.addEventListener('click', () => {
  if (generatedData && generatedData.claudePrompt) {
    modalClaudeContent.textContent = generatedData.claudePrompt;
    claudeModal.classList.remove('hidden');
  }
});

// Close Claude modal
closeClaudeModalBtn.addEventListener('click', () => {
  claudeModal.classList.add('hidden');
});

// Close Claude modal when clicking outside
claudeModal.addEventListener('click', (e) => {
  if (e.target === claudeModal) {
    claudeModal.classList.add('hidden');
  }
});

// Helper function to format document text as HTML
function formatDocumentForDisplay(text) {
  const lines = text.split('\n');
  let result = [];
  let inTable = false;
  let tableRows = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines
    if (!trimmed) {
      if (inTable && tableRows.length > 0) {
        result.push('<table>');
        tableRows.forEach((row, idx) => {
          const isHeader = idx === 0 || idx === 1;
          const cells = row.split('|').filter(c => c.trim());
          if (cells.length > 0 && !row.includes('---')) {
            const tag = isHeader ? 'th' : 'td';
            result.push('<tr>' + cells.map(c => `<${tag}>${c.trim()}</${tag}>`).join('') + '</tr>');
          }
        });
        result.push('</table>');
        inTable = false;
        tableRows = [];
      }
      continue;
    }

    // Check if it's a table row
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      if (!inTable) {
        inTable = true;
        tableRows = [];
      }
      tableRows.push(trimmed);
    } else if (trimmed.includes('---')) {
      // Skip separator rows
      continue;
    } else {
      // Close table if open
      if (inTable && tableRows.length > 0) {
        result.push('<table>');
        tableRows.forEach((row, idx) => {
          const isHeader = idx === 0 || idx === 1;
          const cells = row.split('|').filter(c => c.trim());
          if (cells.length > 0) {
            const tag = isHeader ? 'th' : 'td';
            result.push('<tr>' + cells.map(c => `<${tag}>${c.trim()}</${tag}>`).join('') + '</tr>');
          }
        });
        result.push('</table>');
        inTable = false;
        tableRows = [];
      }

      // Handle headers
      if (trimmed.startsWith('##')) {
        let headerText = trimmed.replace(/^#+\s*/, '');
        headerText = formatInlineMarkdown(headerText);
        result.push(`<h2>${headerText}</h2>`);
      } else if (trimmed.startsWith('#')) {
        let headerText = trimmed.replace(/^#+\s*/, '');
        headerText = formatInlineMarkdown(headerText);
        result.push(`<h1>${headerText}</h1>`);
      } else if (trimmed) {
        // Regular paragraph
        let paragraphText = formatInlineMarkdown(trimmed);
        result.push(`<p>${paragraphText}</p>`);
      }
    }
  }

  // Close any open table
  if (inTable && tableRows.length > 0) {
    result.push('<table>');
    tableRows.forEach((row, idx) => {
      const isHeader = idx === 0 || idx === 1;
      const cells = row.split('|').filter(c => c.trim());
      if (cells.length > 0) {
        const tag = isHeader ? 'th' : 'td';
        result.push('<tr>' + cells.map(c => `<${tag}>${c.trim()}</${tag}>`).join('') + '</tr>');
      }
    });
    result.push('</table>');
  }

  return result.join('');
}

// Helper to format inline markdown (bold, italic, etc)
function formatInlineMarkdown(text) {
  // Bold
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // Italic
  text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  // Escape HTML
  return text;
}

// Initialize: Show how-to-use modal on page load (check if user has seen it before)
document.addEventListener('DOMContentLoaded', function() {
  const hasSeenTutorial = localStorage.getItem('personalizeDecks_tutorial_seen');
  if (!hasSeenTutorial) {
    setTimeout(() => {
      const howToModal = document.getElementById('howToUseModal');
      if (howToModal) {
        howToModal.classList.remove('hidden');
        localStorage.setItem('personalizeDecks_tutorial_seen', 'true');
      }
    }, 500);
  }

  // Help button handler
  const helpBtn = document.getElementById('helpBtn');
  if (helpBtn) {
    helpBtn.addEventListener('click', function() {
      const howToModal = document.getElementById('howToUseModal');
      if (howToModal) {
        howToModal.classList.remove('hidden');
      }
    });
  }
});
