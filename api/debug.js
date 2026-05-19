// Debug endpoint to test Gemini API directly

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyCQyMENqk_FdAwBIr4w0vq3LXYQaQiir0k';

  try {
    // Try different endpoints to find which one works
    const endpoints = [
      {
        name: 'v1beta1 with gemini-pro',
        url: 'https://generativelanguage.googleapis.com/v1beta1/models/gemini-pro:generateContent'
      },
      {
        name: 'v1 with gemini-pro',
        url: 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent'
      },
      {
        name: 'v1beta with gemini-1.5-flash',
        url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'
      }
    ];

    const results = [];

    for (const endpoint of endpoints) {
      try {
        const url = `${endpoint.url}?key=${GEMINI_API_KEY}`;

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: "Hello"
              }]
            }]
          })
        });

        const text = await response.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          data = text.substring(0, 200);
        }

        results.push({
          endpoint: endpoint.name,
          status: response.status,
          success: response.ok,
          response: data
        });
      } catch (error) {
        results.push({
          endpoint: endpoint.name,
          error: error.message
        });
      }
    }

    return res.status(200).json({
      apiKeyExists: !!GEMINI_API_KEY,
      apiKeyLength: GEMINI_API_KEY.length,
      apiKeyPreview: GEMINI_API_KEY.substring(0, 10) + '...',
      results: results
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
};
