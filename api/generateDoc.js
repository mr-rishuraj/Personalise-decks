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
  const sections = payload.sections ? payload.sections.join(', ') : 'standard partnership sections';

  return `# Figma Design Brief: ${payload.companyName} x ${payload.yourOrg} Partnership Deck
## For: ${payload.eventName}

---

## DESIGN VISION
Create a compelling, branded partnership proposal deck that positions the collaboration between ${payload.yourOrg} and ${payload.companyName} as mutually valuable and forward-thinking. This deck will be the visual anchor for partnership discussions and should communicate professionalism, innovation, and shared success.

## BRAND GUIDELINES
- **Primary Color**: ${payload.primaryColor} (headings, key callouts, CTAs)
- **Secondary Color**: ${payload.secondaryColor} (accents, dividers, supporting elements)
${payload.logoUrl ? `- **Logo**: ${payload.logoUrl} (featured prominently on title slide and footer)` : '- **Logo**: Include ${payload.yourOrg} and ${payload.companyName} logos with proper spacing'}
- **Tone**: ${payload.designTone}
- **Style**: ${styleDesc}

## DESIGN SYSTEM REQUIREMENTS
1. **Typography Hierarchy**
   - H1: Large, bold headlines (40-56px) for section titles
   - H2: Subheadings (28-32px) for key points
   - Body: Clean, readable (14-16px) for descriptions
   - Accent: Bold callouts for statistics/metrics

2. **Layout Grid**
   - 12-column grid system for consistency
   - Generous white space (minimum 40px margins)
   - Content width: 80% of slide for visual breathing room
   - Consistent spacing: 16px, 24px, 32px, 48px increments

3. **Visual Elements**
   - Dividers: Subtle lines or color bars (use secondary color)
   - Icons: Consistent style, 24-48px sizes
   - Imagery: High-quality, modern photography or illustrations
   - Data visualization: Clean charts, graphs (matches color palette)

## SLIDE STRUCTURE (8-10 slides)
1. **Cover Slide**: Impactful title with both logos, event name, date
2. **Partnership Overview**: "Why we're here" - the opportunity statement
3. **Strategic Fit**: Venn diagram or comparison showing complementary strengths
4. **Company Profiles**: Side-by-side snapshots (${payload.companyName} & ${payload.yourOrg})
5. **Proposed Deliverables**: Visual breakdown of concrete outputs
6. **Timeline & Milestones**: Gantt-style or milestone visualization
7. **Impact & Benefits**: Benefits for both parties, metrics/KPIs
8. **Success Metrics**: How we measure partnership success
9. **Next Steps**: Clear CTAs and contact information

## DELIVERABLES
- Mockup types: ${mockupTypes}
- File structure: ${payload.figmaStructure}
- Resolution: 1920x1080px (presentation) + export specs for print/web
- Interactive elements: Hover states, animations noted (but not animated in Figma)
- Brand consistency guide embedded in Figma file

## TONE & FEELING
- Professional yet approachable
- Data-backed but visually engaging
- Modern without being trendy
- Focuses on partnership value, not individual pitches

## KEY DESIGN PRINCIPLES
✓ Visual hierarchy guides the viewer's eye to key messages
✓ Data is presented beautifully, not just functionally
✓ Plenty of white space to avoid cognitive overload
✓ Consistent use of color for visual continuity
✓ Typography is intentional and readable
✓ Images/illustrations reinforce the partnership message
✓ Every slide serves a purpose in telling the partnership story

---

Export as: Figma file + high-res PNG/PDF exports for presentations`;
}

function generateClaudePrompt(payload) {
  const styleDesc = getDesignStyleDescription(payload.designStyle);

  return `# Visual Mockups: ${payload.companyName} x ${payload.yourOrg} Partnership Deck

## PROJECT BRIEF
Create 8-10 compelling slide mockups for a partnership proposal presentation. These mockups should tell the story of a strategic collaboration between ${payload.yourOrg} and ${payload.companyName} for the ${payload.eventName} event, positioning the partnership as mutually beneficial and professionally executed.

## BRAND SPECIFICATIONS
- **Event**: ${payload.eventName}
- **Organization**: ${payload.yourOrg}
- **Partner Company**: ${payload.companyName}
- **Primary Brand Color**: ${payload.primaryColor}
- **Secondary Brand Color**: ${payload.secondaryColor}
${payload.logoUrl ? `- **Logo Reference**: ${payload.logoUrl}` : ''}
- **Design Philosophy**: ${styleDesc}
- **Visual Tone**: ${payload.designTone}

## DESIGN DIRECTION
Create slides that are:
✓ **Visually Balanced**: Equal weight to text and whitespace
✓ **Data-Forward**: Use charts, metrics, and visual hierarchies
✓ **Brand-Consistent**: Colors, typography, and spacing feel cohesive
✓ **Modern & Professional**: No dated design trends, timeless aesthetic
✓ **Emotionally Resonant**: Communicate partnership value and shared vision
✓ **Accessible**: High contrast, readable fonts, inclusive imagery

## SLIDE BREAKDOWN

**Slide 1: COVER/TITLE**
- Large, bold headline: "${payload.companyName} + ${payload.yourOrg} Partnership"
- Subheading: Event name and date
- Both company logos positioned symmetrically
- Background: Subtle gradient or pattern using brand colors
- Overall feeling: "This is important, we're ready"

**Slide 2: PARTNERSHIP OPPORTUNITY**
- Headline: "Seizing the Moment"
- Key message: Why this partnership, why now
- Visual element: Timeline or progression arrows showing convergence
- Supporting text: 2-3 punchy statements about mutual benefit
- Color accent: Primary color for emphasis

**Slide 3: STRATEGIC FIT**
- Headline: "Complementary Strengths"
- Visual: Venn diagram, comparison chart, or side-by-side company profiles
- Include: Key differentiators for each organization
- Data-driven: Use numbers, metrics where available
- Secondary color for comparison elements

**Slide 4: COMPANY SNAPSHOT (${payload.companyName})**
- Company logo, name, tagline
- 3-4 key facts (industry, size, mission, expertise)
- Visual element: Brand icon or illustration
- Clean card-like layout with breathing room

**Slide 5: PROPOSED DELIVERABLES**
- Headline: "What We'll Deliver"
- Visual: Icons or illustrations for each deliverable
- Format: Grid or card layout (4-6 items max)
- Each item: Icon + title + brief description
- Use primary color for callouts

**Slide 6: TIMELINE & MILESTONES**
- Headline: "Journey to Launch"
- Visual: Horizontal timeline or milestone path
- Key dates: Clearly marked phases (Planning, Development, Launch, etc.)
- Color coding: Use secondary color for milestones
- Progress indication: Bars or checkmarks showing progression

**Slide 7: IMPACT & BENEFITS**
- Headline: "Value for Both Parties"
- Split layout: ${payload.yourOrg} benefits | ${payload.companyName} benefits
- Use icons, numbers, and short phrases
- Emphasize mutual gains, not one-sided value
- Large, bold numbers for key metrics

**Slide 8: SUCCESS METRICS**
- Headline: "How We Measure Success"
- Visual: Dashboard-style layout or metric cards
- Include: 4-6 KPIs with target numbers
- Visual representation: Gauges, progress bars, or charts
- Color consistency: Primary color for progress indicators

**Slide 9: NEXT STEPS & CALL TO ACTION**
- Headline: "Let's Make This Happen"
- Visual: Bold CTA button or arrow
- Contact information: Names, emails, phone numbers
- Timeline: "Decision by [date]" or "Kickoff [date]"
- Closing sentiment: Confident, positive, forward-looking

## MOCKUP REQUIREMENTS
- **Format**: High-fidelity visual mockups (not wireframes)
- **Resolution**: 1920x1080px (presentation standard)
- **Style**: ${styleDesc}
- **Imagery**: Modern, professional stock photos or illustrations (or describe style)
- **Typography**: Sans-serif recommended for modern look
- **Consistency**: Same design system applied to all slides
- **Annotations**: Include design notes on color usage, spacing, typography

## VISUAL STYLE GUIDE
- **Primary Color (${payload.primaryColor}})**: Headlines, key CTAs, important callouts
- **Secondary Color (${payload.secondaryColor}})**: Accents, supporting elements, secondary information
- **White Space**: Minimum 40px margins, maximum visual density 70%
- **Typography**: 2-3 font families max (1 header, 1 body)
- **Icons**: Consistent line weight, minimal style
- **Images**: High quality, diverse, professional

## TONE & MESSAGING
Each slide should communicate:
- Confidence in the partnership
- Clear mutual benefits
- Professional execution
- Shared vision for success
- Respect for both organizations

---

Deliver: 8-10 polished, presentation-ready mockup images in sequence, each with descriptive captions explaining the design choices and messaging strategy.`;
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
