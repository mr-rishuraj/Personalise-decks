# Personalise Decks - Partnership Proposal Generator

A web application that generates professional partnership proposal documents and design prompts for Figma/Claude Design.

## Features

✅ **Two-Panel Interface**
- Left: Input form for all proposal details
- Right: Live preview of generated outputs

✅ **Content Generation**
- Professional Word documents (.docx)
- Figma design briefs
- Claude Design prompts

✅ **Customization**
- Document length (4-8 pages)
- Tone and style options
- Color scheme customization
- Font preferences
- Section selection
- Design style options

✅ **File Support**
- Upload MoM (PDF/TXT/DOCX)
- Pitch deck links (Google Drive/PDF)
- Company details (website or text)

✅ **AI Model Support**
- Google Gemini (default, free tier available)
- Claude (coming soon)

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js + Express (Vercel Serverless Functions)
- **Document Generation**: docx library
- **AI**: Google Gemini API
- **Hosting**: Vercel

## Local Setup

### Prerequisites
- Node.js 16+ installed
- Gemini API key (free from https://aistudio.google.com/app/apikey)

### Installation

1. **Clone/Download the project**
```bash
cd personalise-decks
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env` file in the root directory:
```env
GEMINI_API_KEY=your-gemini-api-key-here
NODE_ENV=development
```

4. **Run locally**
```bash
npm run dev
```

The site will be available at `http://localhost:3000`

## Deployment to Vercel

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR-USERNAME/personalise-decks.git
git branch -M main
git push -u origin main
```

### Step 2: Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Select your GitHub repository
4. Click "Import"

### Step 3: Add Environment Variables

1. In Vercel dashboard, go to **Settings** → **Environment Variables**
2. Add these variables:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: Your Gemini API key
   - Click "Add"

3. Deploy!

Your site will be available at `https://your-project.vercel.app`

## Usage

1. **Fill Left Panel**
   - Enter basic info (titles, organization names)
   - Upload files (MoM, pitch deck)
   - Provide company details
   - Customize document and design options

2. **Generate**
   - Click "✨ Generate Document & Prompt"
   - Wait for processing (usually 10-30 seconds)

3. **View & Export**
   - Right panel shows previews
   - Download .docx file
   - Copy prompts to clipboard
   - Use in Figma or Claude Design

## Customization Options

### Document
- Title, event name, organization names
- Document length (4, 6, or 8 pages)
- Tone (formal, balanced, startup, innovative)
- Colors (primary & secondary)
- Logo URL
- Font style
- Sections to include

### Design
- Design style (modern, bold, elegant, playful, corporate)
- Design tone
- Mockup types
- Figma file structure

## API Integration

### Gemini API (Default)
- Free tier: 60 requests/minute
- Cost: ~$0.0006 per document (if free tier exceeded)
- No key required for basic use

### Claude API (Coming Soon)
- Cost: ~$0.004 per document
- Requires API key from [claude.ai](https://claude.ai)

## File Structure

```
personalise-decks/
├── public/
│   ├── index.html          # Main UI
│   ├── style.css           # Styling
│   └── script.js           # Frontend logic
├── api/
│   ├── generateDoc.js      # Main handler
│   ├── gemini.js           # Gemini API calls
│   ├── docGenerator.js     # Word doc creation
│   └── fileParser.js       # File parsing (future)
├── .env                    # Environment variables
├── vercel.json             # Vercel config
├── package.json
└── README.md
```

## Troubleshooting

### "Invalid API Key" Error
- Verify your Gemini API key is correct
- Check it in Vercel Environment Variables
- Get a new key from [aistudio.google.com](https://aistudio.google.com/app/apikey)

### Document Not Generating
- Check browser console for errors
- Ensure all required fields are filled
- Try with fewer customization options

### Vercel Deployment Issues
- Verify all files are pushed to GitHub
- Check Vercel build logs
- Ensure Environment Variables are set

## Future Enhancements

- [ ] Claude API integration
- [ ] PDF file parsing
- [ ] Google Drive direct integration
- [ ] Template library
- [ ] Version history
- [ ] Team collaboration
- [ ] Export to Google Docs
- [ ] Email delivery

## Support

For issues or questions, check:
1. Browser console (F12) for errors
2. Vercel logs in dashboard
3. API response status

## License

MIT
