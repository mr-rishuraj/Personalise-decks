const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyCQyMENqk_FdAwBIr4w0vq3LXYQaQiir0k';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

async function generateWithGemini(payload) {
  try {
    // Build the context for Gemini
    const documentPrompt = buildDocumentPrompt(payload);
    const figmaPrompt = buildFigmaPrompt(payload);
    const claudePrompt = buildClaudePrompt(payload);

    // Generate document content
    const documentContent = await callGemini(documentPrompt);

    return {
      documentText: documentContent,
      figmaPrompt: figmaPrompt,
      claudePrompt: claudePrompt
    };

  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error(`Failed to generate content: ${error.message}`);
  }
}

async function callGemini(prompt) {
  const url = `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 4096,
      }
    })
  }).then(res => res.json());

  if (!response.candidates || !response.candidates[0]) {
    throw new Error('No response from Gemini API');
  }

  return response.candidates[0].content.parts[0].text;
}

function buildDocumentPrompt(payload) {
  const sections = payload.sections.join(', ');
  const toneDesc = getToneDescription(payload.tone);
  const isPitchDeckDefault = payload.pitchDeckContent === 'Ignite_25_pitchdeck.pdf';

  return `You are a professional business proposal writer. Create a ${payload.docLength}-page strategic partnership proposal between ${payload.yourOrg} and ${payload.companyName} for the ${payload.eventName} event.

Context:
- Your Organization: ${payload.yourOrg}
- Partner Company: ${payload.companyName}
- Event: ${payload.eventName}
${isPitchDeckDefault ? `- Event Pitch Deck: Using default Ignite 2025 pitch deck context` : `- Pitch Deck Info: ${payload.pitchDeckContent}`}
${payload.companyWebsite ? `- Company Website: ${payload.companyWebsite}` : ''}
${payload.companyText ? `- Company Details: ${payload.companyText}` : ''}
${payload.additionalNotes ? `- Additional Requirements: ${payload.additionalNotes}` : ''}

Tone & Style: ${toneDesc}

Sections to Include: ${sections}

Instructions:
1. Make it professional, scannable, and visually structured
2. Use bullet points and tables instead of long paragraphs
3. Keep prose minimal and punchy (max 2-3 sentences per paragraph)
4. Focus on business value and partnership benefits
5. Ensure exactly ${payload.docLength} pages
6. Use professional language with startup ecosystem tone
7. Maximize white space and readability
8. Bold key points and headings

Create the proposal content in clean, formatted text that can be converted to a Word document. Use markdown-style formatting with headers (# for main, ## for sub), **bold** for emphasis, and - for bullets.`;
}

function buildFigmaPrompt(payload) {
  const mockupTypes = payload.mockups.join(', ') || 'slides and thumbnails';
  const styleDesc = getDesignStyleDescription(payload.designStyle);

  return `You are a expert design brief writer for Figma. Create a detailed design brief for a personalized partnership proposal deck for ${payload.companyName}.

Design Requirements:
- Style: ${styleDesc}
- Tone: ${payload.designTone}
- Mockup Types: ${mockupTypes}
- File Structure: ${payload.figmaStructure}
- Primary Color: ${payload.primaryColor}
- Secondary Color: ${payload.secondaryColor}
${payload.logoUrl ? `- Company Logo: ${payload.logoUrl}` : ''}

Event/Partnership Context:
- Event: ${payload.eventName}
- Your Org: ${payload.yourOrg}
- Partner: ${payload.companyName}

Brief should include:
1. Design system specifications
2. Color palette and typography
3. Layout grid and spacing
4. Component library needed
5. Page/slide breakdown
6. Animation/interaction notes (if applicable)
7. File structure in Figma
8. Export and delivery specifications

Make it detailed enough that a Figma designer can execute immediately.`;
}

function buildClaudePrompt(payload) {
  const mockupTypes = payload.mockups.join(', ') || 'slides and thumbnails';

  return `Create a comprehensive design prompt for Claude to generate visual mockups of a partnership proposal deck.

Context:
- Event: ${payload.eventName}
- Your Organization: ${payload.yourOrg}
- Partner Company: ${payload.companyName}
- Design Style: ${payload.designStyle}
- Design Tone: ${payload.designTone}

Instructions for Claude:
1. Generate mockups for ${mockupTypes}
2. Use primary color (${payload.primaryColor}) and secondary color (${payload.secondaryColor})
3. Create 6-8 key slides showing:
   - Cover slide with company branding
   - Partnership overview
   - Event details
   - Key deliverables
   - Timeline
   - Next steps
4. Ensure professional, clean, modern design
5. Include specific color codes and fonts used
6. Add comments explaining design decisions
7. Create ${payload.figmaStructure === 'nested' ? 'organized page structure' : 'flat design'}

Focus on creating visuals that communicate partnership value, event excellence, and mutual benefits.`;
}

function getToneDescription(tone) {
  const tones = {
    formal: 'Formal, professional, corporate. Use sophisticated language and structured formatting.',
    balanced: 'Balanced mix of professional and approachable. Clear and confident tone.',
    startup: 'Casual, energetic, startup-style. Use conversational language and modern phrasing.',
    innovative: 'Forward-thinking, innovative, cutting-edge. Emphasize growth and transformation.'
  };
  return tones[tone] || tones.balanced;
}

function getDesignStyleDescription(style) {
  const styles = {
    modern: 'Modern and minimalist with clean lines, generous white space, and contemporary typography',
    bold: 'Bold, statement-making design with strong colors, dramatic layouts, and confident typography',
    elegant: 'Elegant and sophisticated with refined color palette, premium typography, and classical proportions',
    playful: 'Playful and creative with vibrant colors, dynamic layouts, and expressive design elements',
    corporate: 'Corporate and formal with structured layouts, professional color schemes, and authoritative presentation'
  };
  return styles[style] || styles.modern;
}

module.exports = { generateWithGemini };
