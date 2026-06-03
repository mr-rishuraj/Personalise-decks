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
    const { companyName, companyWebsite, companyText } = req.body;

    if (!companyName) {
      return res.status(400).json({ message: 'Company name is required' });
    }

    if (!companyWebsite && !companyText) {
      return res.status(400).json({ message: 'Either company website or company text is required' });
    }

    console.log(`Analyzing colors for: ${companyName}`);

    let contentToAnalyze = companyText || '';

    if (companyWebsite && !companyText) {
      try {
        contentToAnalyze = await fetchWebsiteContent(companyWebsite);
      } catch (error) {
        console.log('Could not fetch website, returning default colors:', error.message);
        return res.status(200).json({
          primaryColor: '#1F3864',
          secondaryColor: '#2E5090',
          reasoning: 'Could not fetch website. Using default professional colors.',
          success: false
        });
      }
    }

    const colors = await extractColorsWithGemini(companyName, contentToAnalyze);

    return res.status(200).json({
      primaryColor: colors.primary,
      secondaryColor: colors.secondary,
      reasoning: colors.reasoning,
      success: true
    });

  } catch (error) {
    console.error('Color analysis error:', error.message);
    return res.status(500).json({
      message: error.message || 'Failed to analyze company colors',
      error: error.toString(),
      primaryColor: '#1F3864',
      secondaryColor: '#2E5090'
    });
  }
};

async function fetchWebsiteContent(websiteUrl) {
  const url = websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 5000
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();

    const textContent = html
      .replace(/<style[\s\S]*?<\/style>/g, '')
      .replace(/<script[\s\S]*?<\/script>/g, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .substring(0, 3000);

    return textContent;
  } catch (error) {
    throw new Error(`Could not fetch website: ${error.message}`);
  }
}

async function extractColorsWithGemini(companyName, contentToAnalyze) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent';

  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured');
  }

  const prompt = `What are the primary and secondary brand colors for ${companyName}?
Info: ${contentToAnalyze.substring(0, 100)}

Answer with ONLY these two hex colors, one per line:
#XXXXXX
#XXXXXX`;


  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
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
          temperature: 0.1,
          maxOutputTokens: 150
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

    const responseText = data.candidates[0].content.parts[0].text.trim();
    console.log('Full response length:', responseText.length);
    console.log('Raw response:', responseText);

    // Extract hex colors from response
    const hexPattern = /#[0-9A-Fa-f]{6}/g;
    const matches = responseText.match(hexPattern);

    if (!matches || matches.length === 0) {
      console.error('Could not extract any colors from:', responseText.substring(0, 100));
      throw new Error('Could not extract colors from response');
    }

    const primary = validateHexColor(matches[0]);
    // If only one color found, use a complementary color (white for dark colors, dark for light)
    let secondary = matches.length > 1 ? validateHexColor(matches[1]) : '#FFFFFF';

    // If primary is very dark, use white; if very light, use dark
    const rgb = parseInt(primary.substring(1), 16);
    const brightness = (rgb >> 16 & 255) + (rgb >> 8 & 255) + (rgb & 255);
    if (brightness < 384) { // (255+255+255)/2
      secondary = '#FFFFFF';
    } else if (matches.length === 1) {
      secondary = '#1F3864';
    }

    return {
      primary: primary,
      secondary: secondary,
      reasoning: 'Analyzed company branding'
    };
  } catch (error) {
    console.error('Gemini color analysis error:', error.message);
    throw error;
  }
}

function validateHexColor(color) {
  if (!color) return '#1F3864';
  const hex = color.replace('#', '');
  if (hex.length !== 6 && hex.length !== 3) return '#1F3864';
  return '#' + hex.toUpperCase();
}
