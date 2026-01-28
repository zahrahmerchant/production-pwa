# Git Commands - Push to GitHub

Once you've tested everything locally and you're ready to deploy, use these commands:

## Step 1: Check What Changed

```bash
git status
```

You should see:
- `backend/` folder (new)
- Modified `app.js`
- New documentation files

## Step 2: Add Everything

```bash
git add .
```

This stages all changes for commit.

## Step 3: Commit with a Message

```bash
git commit -m "Add complete backend: Express.js + SQLite + API"
```

## Step 4: Push to GitHub

```bash
git push origin main
```

After this:
- ✅ Your code is on GitHub
- ✅ Netlify detects the change and auto-deploys frontend
- ✅ Backend folder is ready to deploy to Railway

## Full Command Sequence

```bash
# Navigate to your project
cd d:\Users\Zahra\Work\Saftech\production-pwa

# Check status
git status

# Stage all changes
git add .

# Commit
git commit -m "Add production backend with Express.js, SQLite, and REST API"

# Push to GitHub
git push origin main
```

Wait for Netlify to deploy (shows "Deployed" badge), then deploy backend to Railway.

## Deploying Backend to Railway

After pushing to GitHub:

1. Go to **https://railway.app**
2. Log in with GitHub
3. Click **"New Project"** → **"Deploy from GitHub"**
4. Select your `production-pwa` repository
5. Railway auto-detects Node.js
6. Deploys backend automatically
7. Copy the URL it gives you
8. Update `app.js` with the URL:

```javascript
// In app.js, find the save() function and change:
const backendUrl = 'https://your-railway-url.railway.app/api/logs';
```

9. Commit and push again:

```bash
git add app.js
git commit -m "Update backend URL to production"
git push origin main
```

10. Netlify auto-deploys with the new URL
11. Done! ✨

## Verification Checklist

- [ ] `git push origin main` completed
- [ ] Netlify shows "Deployed" badge
- [ ] You deployed backend to Railway
- [ ] Updated app.js with Railway URL
- [ ] Pushed updated app.js to GitHub
- [ ] Netlify re-deployed with new URL
- [ ] Tested on production: filled form → saved
- [ ] Checked Railway logs show the POST request

## If Something Goes Wrong

### "Permission denied (publickey)"
```bash
# Ensure SSH key is set up
git config user.email "your-email@example.com"
git config user.name "Your Name"
```

### "Merge conflict"
```bash
# Pull latest and merge
git pull origin main
# Then add, commit, push
```

### "branch is behind"
```bash
# Pull latest
git pull origin main
# Then push
git push origin main
```

### "Failed to push"
```bash
# Check remote URL
git remote -v

# Should show GitHub URL. If not:
git remote set-url origin https://github.com/your-username/production-pwa.git
git push origin main
```

## Useful Git Commands

```bash
# See your commit history
git log --oneline

# See what's different from GitHub
git status

# See detailed changes
git diff

# Undo last commit (if not pushed)
git reset --soft HEAD~1
git reset app.js  # Or specific file

# See all branches
git branch -a

# Create a new branch
git checkout -b feature-name

# Switch back to main
git checkout main
```

## GitHub Repository Structure

After deployment, your repo looks like:

```
production-pwa/
├── README.md
├── index.html
├── app.js                    ← Updated: calls backend
├── style.css
├── manifest.json
├── service-worker.js
├── lists.json
├── package.json
├── netlify.toml
├── QUICK_START.md           ← New
├── BACKEND_SETUP_SUMMARY.md ← New
├── BACKEND_INTEGRATION.md   ← New
├── DEPLOY_BACKEND.md        ← New
├── DEPLOYMENT_CHECKLIST.md  ← New
└── backend/                 ← New
    ├── server.js            ← Express API
    ├── package.json         ← Dependencies
    ├── README.md            ← Backend docs
    └── production-logs.db   ← Database (auto-created)
```

## Once Everything is Deployed

Your live system will be:

```
https://your-site.netlify.app  ← Frontend (PWA on Netlify)
         ↓ POST to
https://your-backend.railway.app/api/logs  ← Backend (API on Railway)
         ↓ Saves to
     SQLite Database (on Railway)
```

Users can:
1. ✅ Visit your PWA
2. ✅ Fill and save production logs
3. ✅ Works offline (service worker)
4. ✅ Installable on home screen
5. ✅ Data persists in your database

## Summary

**Today (Local Testing):**
```bash
cd backend && npm start          # Terminal 1
npm start                         # Terminal 2
# Test at http://localhost:8080
```

**Tomorrow (Production Deployment):**
```bash
# Push to GitHub
git add .
git commit -m "Backend ready for production"
git push origin main

# Deploy backend to Railway
# (3-5 minutes for Railway build)

# Update app.js with Railway URL
# Push again
git add app.js
git commit -m "Update backend URL"
git push origin main

# Netlify auto-deploys
# Everything is live! ✨
```

---

Need help? Check documentation:
- `QUICK_START.md` - Quick overview
- `BACKEND_SETUP_SUMMARY.md` - Detailed setup
- `DEPLOY_BACKEND.md` - Railway deployment
- `backend/README.md` - API reference
