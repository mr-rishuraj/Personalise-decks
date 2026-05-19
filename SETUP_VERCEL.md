# Vercel Setup - Step by Step

## Prerequisites
- GitHub account (free)
- Vercel account (free)
- This repository pushed to GitHub

---

## Step 1: Create GitHub Repository

### Option A: New Repository
```bash
# Initialize git
git init
git add .
git commit -m "Initial commit: Personalise Decks"
git branch -M main

# Create repo on GitHub.com, then:
git remote add origin https://github.com/YOUR-USERNAME/personalise-decks.git
git push -u origin main
```

### Option B: Existing Repository
```bash
git add .
git commit -m "Add Personalise Decks generator"
git push origin main
```

---

## Step 2: Connect to Vercel

### 2.1 Go to Vercel
- Visit https://vercel.com
- Click "Sign Up" or "Log In"

### 2.2 Create New Project
- Click "New Project" or "Add New..." → "Project"
- Select "Continue with GitHub"
- Authorize Vercel to access your GitHub

### 2.3 Select Repository
- Find `personalise-decks` in your repositories
- Click "Select"
- Click "Import"

### 2.4 Configure Project
You should see:
- **Project Name:** personalise-decks (can customize)
- **Framework:** Other (auto-detected)
- **Root Directory:** ./ (keep default)

Don't change anything else. Click **"Deploy"**

---

## Step 3: Add Environment Variables

⚠️ **Important:** Do this BEFORE the first deployment completes!

### 3.1 Go to Project Settings
- In Vercel dashboard, click your project
- Go to **"Settings"** tab (top menu)
- Click **"Environment Variables"** (left sidebar)

### 3.2 Add Gemini API Key
- **Name:** `GEMINI_API_KEY`
- **Value:** `AIzaSyCQyMENqk_FdAwBIr4w0vq3LXYQaQiir0k`
- **Environments:** Select "Production", "Preview", "Development"
- Click **"Save"**

### 3.3 Optional: Claude API Key (for future)
- **Name:** `CLAUDE_API_KEY`
- **Value:** `sk-...` (when you have one)
- Click **"Save"**

---

## Step 4: Verify Deployment

### Check Deployment Status
1. Go to **"Deployments"** tab
2. Wait for status to change to "Ready" (green checkmark)
3. This usually takes 2-3 minutes

### Visit Your Site
- Click the deployment URL (shown at top)
- It should be: `https://personalise-decks-{random}.vercel.app`
- Or your custom domain if configured

---

## Step 5: Test It

1. Open your Vercel URL
2. Fill out the form:
   - Title: "Test Partnership"
   - Event: "Test Event"
   - Your Org: "Your Organization"
   - Partner: "Partner Company"
3. Click **"Generate Document & Prompt"**
4. Wait 10-30 seconds
5. Should see output on the right panel

---

## Step 6: Share with Team

Send your team the URL:
```
https://personalise-decks-{random}.vercel.app
```

No installation needed! They just open the link and start using it.

---

## Troubleshooting

### Deployment Failed (Red X)
1. Click the failed deployment
2. Go to **"Logs"** tab
3. Look for error messages
4. Common issues:
   - Missing files (check you pushed everything)
   - Wrong package.json
   - Syntax errors in code

**Fix:** Push changes to GitHub, Vercel auto-redeploys

### Function Error (500 Error)
1. Go to **"Functions"** in project dashboard
2. Check function logs
3. Verify Environment Variables are set
4. Check API key is correct

### API Key Not Working
1. Verify key in Vercel Settings → Environment Variables
2. Get new key: https://aistudio.google.com/app/apikey
3. Update in Vercel
4. Redeploy: Go to Deployments → last deployment → "Redeploy"

### CORS Errors
- Already handled in code
- If still issues, check browser console (F12)
- Report in GitHub issues

---

## Custom Domain (Optional)

### Add Your Domain
1. Go to **"Settings"** → **"Domains"**
2. Enter your domain (e.g., decks.yourdomain.com)
3. Follow DNS instructions
4. Wait 24-48 hours for DNS propagation

### Using GitHub Pages Domain
If you have a GitHub Pages site, you can add a subdomain:
1. In Vercel: Add subdomain
2. Update DNS records at your registrar
3. Vercel will show you the specific CNAME record

---

## Auto-Redeploy on GitHub Push

Vercel already does this by default!
- Push code to main branch
- Vercel automatically redeploys
- Watch progress in Deployments tab

---

## Monitoring & Logs

### View Deployment Logs
- Go to **"Deployments"** tab
- Click a deployment
- Click **"Logs"** to see build logs

### Monitor Function Calls
- Go to **"Functions"** tab
- See real-time logs of API calls
- Useful for debugging

### View Error Tracking
- Go to **"Monitor"** tab (if available in your plan)
- See errors and performance metrics

---

## Updates & Redeployment

### When to Redeploy
- Usually automatic on GitHub push
- Manual redeploy: Deployments → last deployment → "Redeploy"

### Update Environment Variables
1. Settings → Environment Variables
2. Change value
3. Automatically triggers redeploy

### Rollback to Previous Version
- Go to Deployments
- Click any previous deployment
- Click "Promote to Production"

---

## Next Steps

1. ✅ Site is live!
2. Share URL with team
3. Generate test proposals
4. Get feedback
5. Customize colors/fonts as needed
6. Optional: Add custom domain
7. Optional: Integrate Claude API

---

## Support

- Vercel Docs: https://vercel.com/docs
- GitHub Issues: Check repository for issues
- Community: Vercel Discord/Forums

Happy deploying! 🚀
