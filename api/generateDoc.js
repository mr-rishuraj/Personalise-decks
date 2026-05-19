const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, Table, TableRow, TableCell } = require('docx');

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
      documentText: documentText,
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

  const prompt = `You are an expert business proposal writer creating a professional, polished ${payload.docLength}-page strategic partnership proposal between ${payload.yourOrg} and ${payload.companyName} for ${payload.eventName}.

CRITICAL FORMATTING REQUIREMENTS:
1. Use CLEAN, PROFESSIONAL language - NO bullet point symbols in markdown, use natural formatting
2. Structure clearly with numbered headers: ## 1. Title, ## 2. Title, etc.
3. Use ONLY these markdown elements: ## headers, **bold**, *italics*, and plain paragraphs
4. For tables: Use proper markdown table format with | separators
5. Keep paragraphs SHORT (2-3 sentences max)
6. NO page break markers or "●" symbols
7. ENSURE document is COMPLETE - all sections must be finished
8. Professional, startup ecosystem tone
9. Focus on BUSINESS VALUE and MUTUAL BENEFITS

Create a ${payload.docLength}-page strategic partnership proposal between ${payload.yourOrg} and ${payload.companyName} for the ${payload.eventName} event.

Context:
- Organization: ${payload.yourOrg}
- Partner: ${payload.companyName}
- Event: ${payload.eventName}
${payload.companyWebsite ? `- Website: ${payload.companyWebsite}` : ''}
${payload.companyText ? `- Details: ${payload.companyText.substring(0, 300)}...` : ''}
${payload.additionalNotes ? `- Notes: ${payload.additionalNotes}` : ''}

Tone: ${toneDesc}

REQUIRED STRUCTURE (${payload.docLength} pages):
1. Executive Summary - Overview of partnership
2. Partnership Context - Why now, shared vision
3. Strategic Fit - Complementary strengths and comparison table
4. Proposed Deliverables - Concrete outputs (use table format)
5. Timeline & Milestones - Key dates (use table format)
6. Responsibilities - Who does what (use table format)
7. Strategic Value - Benefits for both parties
8. KPIs & Success Metrics - How we measure success
9. Next Steps & Contact

FORMATTING RULES:
- Use clean markdown tables with | separators for all comparisons and timelines
- Headers: ## Section Title (exactly like this)
- NO bullet symbols (●, -, •) - use natural prose
- Bold **important terms**
- Keep sentences short and punchy
- Use tables liberally for clarity
- COMPLETE ALL SECTIONS - NO TRUNCATION
- Professional, confident tone
- Focus on mutual value and concrete outcomes

Generate EXACTLY ${payload.docLength} pages of polished, professional content.`;

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

    // Add title
    children.push(
      new Paragraph({
        text: 'STRATEGIC PARTNERSHIP PROPOSAL',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 0, after: 300 },
        alignment: AlignmentType.CENTER,
        bold: true
      })
    );

    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      if (!trimmed) {
        i++;
        continue;
      }

      // Headers
      if (trimmed.startsWith('##')) {
        const headerText = trimmed.replace(/^#+\s*/, '').trim();
        children.push(
          new Paragraph({
            text: headerText,
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 150 },
            bold: true,
            thematicBreak: false
          })
        );
        i++;

      } else if (trimmed.startsWith('|')) {
        // Parse and add table
        const tableLines = [];
        while (i < lines.length && lines[i].trim().startsWith('|')) {
          tableLines.push(lines[i].trim());
          i++;
        }

        if (tableLines.length > 2) {
          const table = createTable(tableLines);
          children.push(table);
          children.push(new Paragraph({ text: '', spacing: { after: 150 } }));
        }

      } else {
        // Regular paragraph
        const paragraph = new Paragraph({
          text: trimmed,
          spacing: { after: 150 },
          alignment: AlignmentType.JUSTIFIED
        });
        children.push(paragraph);
        i++;
      }
    }

    const doc = new Document({
      sections: [{
        properties: {
          margins: {
            top: 1440,    // 1 inch
            bottom: 1440,
            left: 1440,
            right: 1440
          }
        },
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

function createTable(lines) {
  const rows = [];
  const cells = lines[0].split('|').filter(c => c.trim()).map(c => c.trim());

  // Header row
  const headerCells = cells.map(cell =>
    new TableCell({
      children: [
        new Paragraph({
          text: cell,
          bold: true,
          alignment: AlignmentType.CENTER
        })
      ],
      shading: {
        type: 'clear',
        fill: 'D3D3D3'
      }
    })
  );

  rows.push(new TableRow({
    children: headerCells
  }));

  // Data rows (skip separator line at index 1)
  for (let i = 2; i < lines.length; i++) {
    const rowCells = lines[i].split('|').filter(c => c.trim()).map(c => c.trim());
    const dataCells = rowCells.map(cell =>
      new TableCell({
        children: [
          new Paragraph({
            text: cell,
            alignment: AlignmentType.LEFT
          })
        ]
      })
    );

    rows.push(new TableRow({
      children: dataCells
    }));
  }

  return new Table({
    rows: rows,
    width: {
      size: 100,
      type: 'pct'
    }
  });
}
