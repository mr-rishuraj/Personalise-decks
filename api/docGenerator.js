const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, Table, TableCell, TableRow, convertInchesToTwip, UnderlineType } = require('docx');

async function createWordDocument(content, options) {
  try {
    // Parse the markdown-style content into structured sections
    const sections = parseContent(content.documentText);

    // Create document structure
    const docSections = [];

    // Add title page
    docSections.push(
      new Paragraph({
        text: options.title || 'Partnership Proposal',
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
        thematicBreak: false,
        style: 'Heading1',
        color: options.primaryColor?.replace('#', '') || '1F3864'
      }),
      new Paragraph({
        text: `${options.yourOrg} & ${options.companyName}`,
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        size: 24
      }),
      new Paragraph({
        text: options.eventName || '',
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
        size: 20
      }),
      new Paragraph({
        text: new Date().toLocaleDateString(),
        alignment: AlignmentType.CENTER,
        spacing: { after: 600 },
        size: 18,
        color: '666666'
      })
    );

    // Add logo if provided
    if (options.logoUrl) {
      docSections.push(
        new Paragraph({
          text: `[Logo: ${options.logoUrl}]`,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
          italics: true,
          color: '999999'
        })
      );
    }

    // Add page break
    docSections.push(new Paragraph({ text: '', pageBreakBefore: true }));

    // Add content sections
    sections.forEach(section => {
      docSections.push(
        new Paragraph({
          text: section.title,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 200 },
          color: options.secondaryColor?.replace('#', '') || '2E5090',
          bold: true,
          border: {
            bottom: {
              color: 'E5E7EB',
              space: 1,
              style: BorderStyle.SINGLE,
              size: 6
            }
          }
        })
      );

      // Add bullets
      if (section.bullets && section.bullets.length > 0) {
        section.bullets.forEach(bullet => {
          docSections.push(
            new Paragraph({
              text: bullet,
              bullet: { level: 0 },
              spacing: { after: 100 },
              indent: { left: 720 }
            })
          );
        });
      }

      // Add paragraphs
      if (section.paragraphs && section.paragraphs.length > 0) {
        section.paragraphs.forEach(para => {
          docSections.push(
            new Paragraph({
              text: para,
              spacing: { after: 200 },
              alignment: AlignmentType.JUSTIFIED
            })
          );
        });
      }

      docSections.push(new Paragraph({ text: '' }));
    });

    // Create document
    const doc = new Document({
      sections: [{
        properties: {},
        children: docSections
      }]
    });

    // Generate buffer
    const buffer = await Packer.toBuffer(doc);

    // Convert to base64
    const base64 = buffer.toString('base64');

    return base64;

  } catch (error) {
    console.error('Error creating Word document:', error);
    throw new Error(`Failed to create Word document: ${error.message}`);
  }
}

function parseContent(markdownContent) {
  const sections = [];
  const lines = markdownContent.split('\n');

  let currentSection = null;
  let currentBullets = [];
  let currentParagraphs = [];

  lines.forEach(line => {
    const trimmed = line.trim();

    if (trimmed.startsWith('##')) {
      // Save previous section
      if (currentSection) {
        currentSection.bullets = currentBullets;
        currentSection.paragraphs = currentParagraphs;
        sections.push(currentSection);
        currentBullets = [];
        currentParagraphs = [];
      }

      // Create new section
      currentSection = {
        title: trimmed.replace(/^#+\s*/, '').trim()
      };

    } else if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
      // Bullet point
      const bulletText = trimmed.replace(/^[-•]\s*/, '').trim();
      if (bulletText) {
        currentBullets.push(bulletText);
      }

    } else if (trimmed.startsWith('#')) {
      // Skip main title
      continue;

    } else if (trimmed.length > 0) {
      // Regular paragraph
      currentParagraphs.push(trimmed);
    }
  });

  // Add last section
  if (currentSection) {
    currentSection.bullets = currentBullets;
    currentSection.paragraphs = currentParagraphs;
    sections.push(currentSection);
  }

  return sections;
}

module.exports = { createWordDocument };
