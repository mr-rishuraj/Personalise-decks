# Personalise Decks - Partnership Proposal Generator

A modern, AI-powered web application that generates professional partnership proposal documents and design prompts for Figma/Claude Design. Features an intuitive two-panel interface, dark theme, automatic brand color detection, and comprehensive tutorial system.

## ✨ Key Features

### 🎨 **Modern User Interface**
- Beautiful dark theme with gradient accents
- Responsive design for desktop, tablet, and mobile devices
- Smooth animations and transitions
- Modern card-based layouts with shadows and borders
- Professional typography and spacing

### 🏠 **Landing & Navigation**
- Comprehensive landing page with how-to-use guide
- Interactive FAQ section with expandable items
- Feature overview cards
- Step-by-step process visualization
- Sticky navigation with easy navigation between pages
- Help button on generator page to access tutorials

### 🤖 **Automatic Brand Color Detection**
- Analyzes company websites to extract brand colors
- Supports text-based company descriptions
- Intelligent color extraction using Google Gemini API
- Automatic fallback to complementary colors
- Real-time color preview with visual swatches

### 📄 **Content Generation**
- Professional Word documents (.docx)
- Figma design briefs with color specifications
- Claude Design prompts
- Multiple output formats from single input

### ⚙️ **Extensive Customization**
- Document length (4-8 pages)
- Multiple tone options (formal, balanced, startup, innovative)
- Brand color customization with auto-detection
- Font style preferences
- Section selection
- Design style options (modern, bold, elegant, playful, corporate)

### 📁 **File Support**
- Upload Minutes of Meeting (MoM) - PDF/TXT/DOCX
- Pitch deck links (Google Drive/PDF)
- Company details (website URL or direct text input - up to 10,000 words)

### 🧠 **AI Model Support**
- Google Gemini API (default, free tier available)
- Claude API support ready (infrastructure in place)

## 🛠 Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (No frameworks)
- **Backend**: Node.js (Vercel Serverless Functions)
- **Document Generation**: docx library
- **AI**: Google Gemini 2.5 Flash API
- **Hosting**: Vercel
- **Styling**: Modern CSS with CSS Variables, Gradients, and Animations
- **Storage**: LocalStorage for user preferences and tutorial state

## 🚀 Local Setup

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- 1-4 Gemini API keys (free from https://aistudio.google.com/app/apikey)
  - **Note:** Using multiple keys distributes quota across them, reducing rate-limit errors

### Installation Steps

1. **Clone or navigate to the project**
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
# Use single key:
GEMINI_API_KEY=your-gemini-api-key-here

# Or use multiple keys (recommended to avoid quota limits):
GEMINI_API_KEY_1=your-first-gemini-api-key
GEMINI_API_KEY_2=your-second-gemini-api-key
GEMINI_API_KEY_3=your-third-gemini-api-key
GEMINI_API_KEY_4=your-fourth-gemini-api-key

NODE_ENV=development
```

**To get Gemini API keys:**
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create API Key" for each key you want to add
3. Add them to your `.env` file as shown above

4. **Run development server**
```bash
npx vercel dev
```

The application will be available at:
- **Landing Page**: `http://localhost:3000` (or `http://localhost:3001`)
- **Generator Page**: `http://localhost:3000/generator.html`

### First Time Visit
- The landing page provides a comprehensive guide on how to use the tool
- When you visit the generator page, a "How to Use" modal appears automatically (only on first visit)
- Click the "?" Help button anytime to view the tutorial again

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
2. Add Gemini API keys (one key is fine, but multiple keys distribute quota):
   - **Name**: `GEMINI_API_KEY_1` | **Value**: Your first Gemini API key
   - **Name**: `GEMINI_API_KEY_2` | **Value**: Your second Gemini API key
   - **Name**: `GEMINI_API_KEY_3` | **Value**: Your third Gemini API key
   - **Name**: `GEMINI_API_KEY_4` | **Value**: Your fourth Gemini API key (optional)
   
   Or use a single key:
   - **Name**: `GEMINI_API_KEY` | **Value**: Your Gemini API key

3. Deploy!

Your site will be available at `https://your-project.vercel.app`

## 📖 How to Use

### Step 1: Visit Landing Page
- Open the application at `http://localhost:3000`
- Browse features, FAQ, and how-it-works guide
- Click "Get Started Now" or "Start Generating" to proceed

### Step 2: Enter Your Information
On the generator page, fill in the left panel:
1. **Basic Information**
   - Partnership Title (e.g., "PIEDS & AirPay Partnership")
   - Event Name (e.g., "Ignite 2026")
   - Your Organization Name (e.g., "PIEDS")
   - Partner Company Name (required field)

2. **Files & Company Information**
   - Upload Minutes of Meeting (MoM) - optional
   - Provide pitch deck link or use default
   - Enter company website URL or paste company details
   - **Automatic color detection**: The app analyzes the company info and extracts brand colors automatically

3. **Document Customization**
   - Choose document length (4, 6, or 8 pages)
   - Select tone (formal, balanced, startup, innovative)
   - Set primary/secondary colors (auto-populated from company analysis)
   - Choose font style
   - Select sections to include

4. **Design Customization**
   - Pick design style (modern, bold, elegant, playful, corporate)
   - Select design tone
   - Choose mockup types
   - Define Figma file structure

5. **Additional Options**
   - Add any special requirements or notes
   - Select output formats (Word, Figma, Claude prompts)

### Step 3: Generate Your Proposal
- Click "✨ Generate Document & Prompt" button
- Wait for processing (10-30 seconds depending on content)
- Watch the live preview update in the right panel

### Step 4: View & Export
- **Word Document**: Click "📥 Download" to get .docx file
- **Figma Prompt**: Click "👁️ View Full" or copy to clipboard
- **Claude Prompt**: Click "👁️ View Full" or copy to clipboard
- Use the prompts in Figma or Claude for further refinement

### 💡 Pro Tips
- Company website analysis for colors works best with established brands
- Be specific in "Additional Notes" for more personalized proposals
- Use different tones to match your brand voice
- Experiment with design styles to find your favorite
- The tutorial is available anytime via the "?" Help button

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

## 📁 Project Structure

```
personalise-decks/
├── public/
│   ├── index.html              # Landing page with how-to guide
│   ├── generator.html          # Partnership proposal generator form
│   ├── style.css               # Modern responsive styling (shared)
│   ├── script.js               # Frontend logic & interactions
│   └── Ignite_25_pitchdeck.pdf # Default sample pitch deck
├── api/
│   ├── generateDoc.js          # Main document generation handler
│   ├── analyzeCompanyColors.js # Brand color detection API
│   ├── gemini.js               # Gemini API integration
│   ├── docGenerator.js         # Word document (.docx) creation
│   └── fileParser.js           # File parsing utilities
├── .env                        # Environment variables (not in repo)
├── .gitignore                  # Git ignore rules
├── vercel.json                 # Vercel deployment config
├── package.json                # Dependencies and scripts
├── package-lock.json           # Locked dependency versions
└── README.md                   # This file
```

### Key Files Explained

- **index.html** - Main landing page featuring:
  - Navigation with CTA buttons
  - Hero section with gradient effects
  - Features overview
  - Step-by-step how-it-works guide
  - Output examples
  - Tips and best practices
  - FAQ section
  - Footer with creator attribution

- **generator.html** - Proposal generator interface with:
  - Navigation bar with back-to-home link
  - Two-panel layout (form + live preview)
  - Interactive how-to-use modal
  - Help button to access tutorial
  - Form sections for all customization options
  - Output preview panels

- **style.css** - Shared modern styling featuring:
  - Dark theme with gradient accents
  - CSS variables for colors and shadows
  - Responsive design (mobile-first)
  - Smooth animations and transitions
  - Modern component styling

- **script.js** - Client-side functionality:
  - Form input handling
  - Company color analysis trigger
  - API calls to backend
  - Output display and formatting
  - Modal and navigation logic
  - Toast notifications

- **analyzeCompanyColors.js** - REST API endpoint for:
  - Fetching company website content
  - Analyzing content with Gemini API
  - Extracting brand colors
  - Returning primary and secondary colors

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

## 🎯 Recent Improvements (Latest Release)

### Dark Theme & Modern Design
- Professional dark color scheme with gradient accents
- Smooth animations and transitions
- Modern shadows and visual effects
- Improved typography with better spacing

### Navigation & Routing
- Back-to-home navigation on generator page
- Help button to access tutorials anytime
- Proper page routing between landing and generator
- Sticky navigation on landing page

### How-to-Use Modal
- Comprehensive interactive tutorial on first visit
- Shows steps, tips, and best practices
- Can be reopened via help button
- Only shows once (stored in browser)

### Responsive Design
- Mobile-friendly interface
- Proper breakpoints for tablets and phones
- Touch-friendly buttons and elements
- Optimized typography for small screens

### Automatic Brand Color Detection
- Analyzes company websites and text
- Extracts primary and secondary colors
- Visual color swatches in notifications
- Auto-populates color fields in form

## 🚀 Planned Features

- [ ] Claude API integration for document generation
- [ ] PDF file parsing and text extraction
- [ ] Google Drive direct folder access
- [ ] Template library with pre-built proposal templates
- [ ] Version history and document revisions
- [ ] Team collaboration with shared proposals
- [ ] Export to Google Docs format
- [ ] Email delivery of generated documents
- [ ] Custom branding and whitelabel options
- [ ] Analytics dashboard for usage tracking

## Support

For issues or questions, check:
1. Browser console (F12) for errors
2. Vercel logs in dashboard
3. API response status

## License

MIT
