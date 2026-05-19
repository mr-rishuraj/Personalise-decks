// List available models with this API key

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyCQyMENqk_FdAwBIr4w0vq3LXYQaQiir0k';

  try {
    const endpoints = [
      {
        name: 'v1 ListModels',
        url: 'https://generativelanguage.googleapis.com/v1/models'
      },
      {
        name: 'v1beta1 ListModels',
        url: 'https://generativelanguage.googleapis.com/v1beta1/models'
      },
      {
        name: 'v1beta ListModels',
        url: 'https://generativelanguage.googleapis.com/v1beta/models'
      }
    ];

    const results = [];

    for (const endpoint of endpoints) {
      try {
        const url = `${endpoint.url}?key=${GEMINI_API_KEY}`;

        const response = await fetch(url);
        const data = await response.json();

        results.push({
          endpoint: endpoint.name,
          status: response.status,
          success: response.ok,
          models: data.models ? data.models.map(m => m.name) : data
        });
      } catch (error) {
        results.push({
          endpoint: endpoint.name,
          error: error.message
        });
      }
    }

    return res.status(200).json({
      apiKey: GEMINI_API_KEY.substring(0, 15) + '...',
      results: results
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
};
