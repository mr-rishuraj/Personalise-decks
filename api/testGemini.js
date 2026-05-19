// Test Gemini API connection

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyDFUMeWqXH...';
    const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent';

    console.log('Testing Gemini API...');
    console.log('API Key exists:', !!GEMINI_API_KEY);
    console.log('API Key length:', GEMINI_API_KEY.length);

    const url = `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`;

    console.log('Calling:', url.substring(0, 100) + '...');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: "Say 'Hello World' in one sentence"
          }]
        }],
        generationConfig: {
          maxOutputTokens: 100,
        }
      })
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    const text = await response.text();
    console.log('Response text:', text.substring(0, 200));

    if (!response.ok) {
      return res.status(response.status).json({
        status: 'GEMINI_ERROR',
        statusCode: response.status,
        message: 'Gemini API returned error',
        responseText: text.substring(0, 500)
      });
    }

    const data = JSON.parse(text);

    if (!data.candidates || !data.candidates[0]) {
      return res.status(500).json({
        status: 'PARSE_ERROR',
        message: 'No candidates in response',
        data: data
      });
    }

    return res.status(200).json({
      status: 'SUCCESS',
      message: 'Gemini API is working',
      response: data.candidates[0].content.parts[0].text
    });

  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);

    return res.status(500).json({
      status: 'ERROR',
      message: error.message,
      stack: error.stack.substring(0, 300)
    });
  }
};
