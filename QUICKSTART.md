# Quick Start Guide

## 🚀 Get Running in 2 Minutes

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Test Locally (Optional)
The website is ready to deploy. No local server needed! Just push to GitHub and connect to Vercel.

### Step 3: Push to GitHub

**If you don't have a GitHub repo yet:**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
```

**Then push to your GitHub repo:**
```bash
git remote add origin https://github.com/YOUR-USERNAME/personalise-decks.git
git push -u origin main
```

### Step 4: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up / Log in
3. Click **"New Project"**
4. Select your GitHub repo `personalise-decks`
5. Click **"Import"**
6. In **Environment Variables**, add:
   - **Name:** `GEMINI_API_KEY`
   - **Value:** `AIzaSyCQyMENqk_FdAwBIr4w0vq3LXYQaQiir0k`
   - Click **"Add"**
7. Click **"Deploy"**

✅ **Done!** Your site is live at `https://your-project.vercel.app`

---

## 🔧 What's Included

- ✅ Two-panel UI (left: input, right: output)
- ✅ Document generation (Word .docx)
- ✅ Figma design prompts
- ✅ Claude Design prompts
- ✅ 15+ customization options
- ✅ Gemini API integration (free!)

---

## 📝 Features

### Left Panel (Input)
- Basic info (titles, organization names)
- File uploads (MoM, pitch deck)
- Company details (website or text)
- Document customization
  - Length (4-8 pages)
  - Tone (formal, balanced, startup, innovative)
  - Colors
  - Font style
  - Sections to include
- Design customization
  - Design style
  - Mockup types
  - Figma structure

### Right Panel (Output)
- Document preview
- Download .docx
- Copy text to clipboard
- Figma design prompt
- Claude Design prompt
- Generation metadata

---

## 🆘 Troubleshooting

### If deployment fails:
1. Check Vercel build logs
2. Ensure all files are pushed to GitHub
3. Verify `package.json` exists
4. Check Environment Variables in Vercel

### If document doesn't generate:
1. Check browser console (F12) for errors
2. Verify all required fields are filled
3. Check Gemini API key is correct
4. Check Vercel function logs

### API Key Issues:
- Get a new free key: https://aistudio.google.com/app/apikey
- Update in Vercel: Settings → Environment Variables

---

## 🎯 Next Steps

1. **Test it out** - Generate a few proposals
2. **Customize** - Adjust colors, fonts, styles
3. **Share with team** - Send them the Vercel URL
4. **Add Claude** (Optional) - Uncomment Claude integration later

---

## 📞 Support

- Check README.md for detailed docs
- Review error messages in browser console
- Check Vercel deployment logs

Enjoy! 🎉
