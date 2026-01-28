# Pre-Deployment Checklist

## Before You Deploy to Netlify

### Code Quality
- [x] No console errors (check F12)
- [x] Service worker registered
- [x] manifest.json is valid
- [x] lists.json has operators, machines, operations
- [x] All buttons functional (Operator, Machine, Operation)
- [x] Time picker works
- [x] Quantity counter works
- [x] Form validation works
- [x] Offline mode works (tested locally)

### PWA Features
- [x] Installable (manifest.json configured)
- [x] Works offline (service worker set up)
- [x] HTTPS ready (Netlify provides)
- [x] Responsive design (mobile/desktop tested)
- [x] Icons configured (SVG in manifest)

### Files to Deploy
```
✓ index.html
✓ app.js
✓ style.css
✓ manifest.json
✓ service-worker.js
✓ lists.json
✓ netlify.toml (config for Netlify)
✓ package.json (metadata)
✓ README.md (documentation)
```

### Before Pushing to GitHub
```bash
# Make sure all changes are committed
git add .
git commit -m "PWA ready for Netlify"

# Verify remote is set to GitHub
git remote -v

# Push to GitHub
git push origin main
```

### Deployment Steps
1. [ ] Go to https://netlify.com
2. [ ] Sign in with GitHub
3. [ ] Click "New site from Git"
4. [ ] Select your production-pwa repo
5. [ ] Leave build settings default (static site)
6. [ ] Click "Deploy site"
7. [ ] Wait for deployment (1-2 minutes)
8. [ ] Copy generated URL
9. [ ] Test the live PWA

### Post-Deployment Testing
- [ ] Open live URL in Chrome
- [ ] Check buttons appear (Operators, Machines, Operations)
- [ ] Try selecting items
- [ ] Test install button in address bar
- [ ] Install to home screen
- [ ] Go offline (DevTools → Offline)
- [ ] App still works offline
- [ ] Hard refresh (Ctrl+Shift+R)
- [ ] Service worker updated

### Customization (Optional Later)
- [ ] Add custom domain (e.g., prodlog.saftech.com)
- [ ] Update lists.json with real data
- [ ] Add backend for saving logs (see BACKEND.md)
- [ ] Set up GitHub Actions for auto-sync from spreadsheet

---

## Command Quick Reference

**Local Testing:**
```bash
npm start
# Open http://localhost:8080
```

**Git Push to Netlify:**
```bash
git add .
git commit -m "message"
git push origin main
# Netlify auto-deploys (check dashboard)
```

**Update Lists After Deploy:**
```bash
# Edit lists.json
# Commit and push
git add lists.json
git commit -m "Update operators/machines/operations"
git push origin main
# Netlify deploys, users get fresh lists on next visit
```

---

## You're All Set! 🚀

Your PWA is:
✅ Fully functional
✅ Works offline
✅ Installable
✅ Ready for Netlify
✅ Production-ready

Just push to GitHub and Netlify handles the rest!
