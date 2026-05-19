// Test endpoint to check if API is working

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  try {
    const timestamp = new Date().toISOString();
    const envCheck = {
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      geminiKeyLength: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0,
      nodeVersion: process.version,
      timestamp: timestamp
    };

    return res.status(200).json({
      status: 'OK',
      message: 'API is working',
      environment: envCheck,
      requestBody: req.body ? 'Received' : 'No body'
    });

  } catch (error) {
    return res.status(500).json({
      status: 'ERROR',
      message: error.message,
      stack: error.stack
    });
  }
};
