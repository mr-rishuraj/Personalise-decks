const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } = require('docx');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const payload = req.body;

    if (!payload.title || !payload.yourOrg || !payload.companyName || !payload.eventName) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    console.log('Generating document for:', payload.companyName);

    // Generate content using Gemini
    const documentText = await generateDocumentWithGemini(payload);
    const figmaPrompt = generateFigmaPrompt(payload);
    const claudePrompt = generateClaudePrompt(payload);

    // Create Word document
    const docBase64 = await createWordDoc(documentText);

    return res.status(200).json({
      documentText: documentText.substring(0, 2000),
      documentBase64: docBase64,
      figmaPrompt: figmaPrompt,
      claudePrompt: claudePrompt,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({
      message: error.message || 'Failed to generate document',
      error: error.toString()
    });
  }
};

async function generateDocumentWithGemini(payload) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyDFUMeWqXH...';
  const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent';

  const sections = payload.sections ? payload.sections.join(', ') : 'all';
  const toneDesc = getToneDescription(payload.tone);

  const prompt = `You are a professional business proposal writer. Create a ${payload.docLength}-page strategic partnership proposal between ${payload.yourOrg} and ${payload.companyName} for the ${payload.eventName} event.

Context:
- Your Organization: ${payload.yourOrg}
- Partner Company: ${payload.companyName}
- Event: ${payload.eventName}
${payload.companyWebsite ? `- Company Website: ${payload.companyWebsite}` : ''}
${payload.companyText ? `- Company Details: ${payload.companyText.substring(0, 500)}...` : ''}
${payload.additionalNotes ? `- Additional Requirements: ${payload.additionalNotes}` : ''}

Tone & Style: ${toneDesc}
Sections to Include: ${sections}

Instructions:
1. Make it professional and scannable
2. Use bullet points and tables instead of long paragraphs
3. Keep prose minimal (max 2-3 sentences per paragraph)
4. Focus on business value and partnership benefits
5. Ensure exactly ${payload.docLength} pages
6. Use professional language with startup ecosystem tone
7. Maximize white space and readability

Create the proposal content in clean, formatted text.`;

  try {
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
          maxOutputTokens: 4096,
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API Error (${response.status}): ${errorText.substring(0, 200)}`);
    }

    const data = await response.json();

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
      throw new Error('Invalid response structure from Gemini API');
    }

    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Gemini API error:', error.message);
    throw error;
  }
}

function generateFigmaPrompt(payload) {
  const mockupTypes = payload.mockups ? payload.mockups.join(', ') : 'slides and thumbnails';
  const styleDesc = getDesignStyleDescription(payload.designStyle);

  return `Design Brief for Figma - ${payload.companyName} Partnership Deck

Event: ${payload.eventName}
Organization: ${payload.yourOrg}
Partner: ${payload.companyName}

Design Requirements:
- Style: ${styleDesc}
- Tone: ${payload.designTone}
- Mockup Types: ${mockupTypes}
- File Structure: ${payload.figmaStructure}
- Primary Color: ${payload.primaryColor}
- Secondary Color: ${payload.secondaryColor}

Create a professional partnership proposal deck design with:
1. Design system specifications
2. Color palette and typography
3. Layout grid and spacing
4. Component library
5. Page/slide breakdown (6-8 slides)
6. File structure in Figma
7. Export specifications`;
}

function generateClaudePrompt(payload) {
  return `Create visual mockups for ${payload.companyName} partnership proposal deck.

Context:
- Event: ${payload.eventName}
- Organization: ${payload.yourOrg}
- Partner: ${payload.companyName}
- Design Style: ${payload.designStyle}
- Design Tone: ${payload.designTone}

Generate mockups for 6-8 key slides showing:
1. Cover slide with company branding
2. Partnership overview
3. Event details
4. Key deliverables
5. Timeline
6. Impact & benefits
7. Next steps

Use primary color (${payload.primaryColor}) and secondary color (${payload.secondaryColor}).
Focus on clean, professional, modern design that communicates partnership value.`;
}

function getToneDescription(tone) {
  const tones = {
    formal: 'Formal, professional, corporate',
    balanced: 'Balanced mix of professional and approachable',
    startup: 'Casual, energetic, startup-style',
    innovative: 'Forward-thinking, innovative, cutting-edge'
  };
  return tones[tone] || 'Professional and balanced';
}

function getDesignStyleDescription(style) {
  const styles = {
    modern: 'Modern and minimalist with clean lines and generous white space',
    bold: 'Bold, statement-making design with strong colors and dramatic layouts',
    elegant: 'Elegant and sophisticated with refined color palette',
    playful: 'Playful and creative with vibrant colors and dynamic layouts',
    corporate: 'Corporate and formal with structured layouts'
  };
  return styles[style] || 'Modern and minimalist';
}

async function createWordDoc(content) {
  try {
    const lines = content.split('\n');
    const children = [];

    lines.forEach((line, index) => {
      if (line.startsWith('##')) {
        children.push(
          new Paragraph({
            text: line.replace(/^#+\s*/, ''),
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
            bold: true
          })
        );
      } else if (line.startsWith('-') || line.startsWith('•')) {
        children.push(
          new Paragraph({
            text: line.replace(/^[-•]\s*/, ''),
            bullet: { level: 0 },
            spacing: { after: 100 }
          })
        );
      } else if (line.trim()) {
        children.push(
          new Paragraph({
            text: line,
            spacing: { after: 200 }
          })
        );
      }
    });

    const doc = new Document({
      sections: [{
        children: children
      }]
    });

    const buffer = await Packer.toBuffer(doc);
    return buffer.toString('base64');

  } catch (error) {
    console.error('Word doc creation error:', error);
    throw new Error(`Failed to create Word document: ${error.message}`);
  }
}
