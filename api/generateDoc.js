const { generateWithGemini } = require('./gemini');
const { createWordDocument } = require('./docGenerator');

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const payload = req.body;

    // Validate required fields
    if (!payload.title || !payload.yourOrg || !payload.companyName || !payload.eventName) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Generate content using selected AI model
    let aiResponse;
    if (payload.apiChoice === 'claude' && payload.claudeKey) {
      // TODO: Implement Claude integration
      return res.status(501).json({ message: 'Claude API integration coming soon' });
    } else {
      aiResponse = await generateWithGemini(payload);
    }

    // Generate Word document
    const docBase64 = await createWordDocument(aiResponse, payload);

    // Return results
    return res.status(200).json({
      documentText: aiResponse.documentText,
      documentBase64: docBase64,
      figmaPrompt: aiResponse.figmaPrompt,
      claudePrompt: aiResponse.claudePrompt,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      message: error.message || 'Internal server error',
      error: error.toString()
    });
  }
}
