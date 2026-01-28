# Deploy to Netlify

Your Production Log PWA is ready to deploy to Netlify! Here's how:

## Step 1: Push to GitHub (if not already done)

```bash
git add .
git commit -m "PWA: Production Log app ready for Netlify"
git push origin main
```

## Step 2: Connect to Netlify

### Option A: Via Netlify UI (Easiest)

1. Go to **https://netlify.com**
2. Click **"Sign up"** or **"Log in"**
3. Choose **"GitHub"** to authenticate
4. Click **"New site from Git"**
5. Select your **production-pwa** repository
6. Leave build settings as default (no build needed for static site)
7. Click **"Deploy site"**

**Done!** Netlify generates a free URL like:
```
https://your-site-name.netlify.app
```

### Option B: Via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

---

## Step 3: Custom Domain (Optional)

In Netlify dashboard:
1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Enter your domain (e.g., `prodlog.saftech.com`)
4. Follow DNS instructions from your domain registrar

---

## What Netlify Does Automatically

✅ Serves your site over **HTTPS** (required for PWA)  
✅ Handles **service worker** registration properly  
✅ Auto-deploys on every GitHub push  
✅ CDN caching for fast global access  
✅ Free SSL certificate  
✅ 404 → index.html routing (needed for PWA)  

All configured in `netlify.toml`!

---

## How It Works

1. **You push to GitHub** → Netlify detects change
2. **Netlify pulls latest code** and deploys
3. **Your PWA is live** at `https://your-site.netlify.app`
4. **Users can install** the app from their phone/desktop
5. **Works offline** with all cached files

---

## Testing the Live PWA

After deployment:

### Desktop (Chrome)
1. Go to https://your-site.netlify.app
2. Click the install icon in address bar
3. Click "Install"
4. App opens as standalone window

### Mobile
1. Open https://your-site.netlify.app in mobile browser
2. Tap menu → "Add to Home Screen" (iOS) or "Install" (Android)
3. App appears on home screen
4. Tap to launch (full-screen, no browser UI)

### Test Offline
1. Open app on phone
2. Toggle airplane mode ON
3. App still works! (all data cached)
4. Try adding logs (stored locally until online)

---

## Important Notes

### Lists.json Updates

When you update `lists.json`:
1. Edit the file in your repo
2. Push to GitHub
3. Netlify auto-deploys
4. Users get fresh lists on next online visit
5. Service worker fetches latest (network-first strategy)

### Caching Strategy

- **Service worker** caches everything on first visit
- **lists.json**: Network-first (tries fresh, falls back to cache)
- **Other files**: Cache-first (uses cache, updates in background)
- **Service worker.js**: No cache (always fresh)

### Offline Data Handling

Currently, the app stores preferences in `localStorage`:
- Date, shift, time selections are saved locally
- If you want to save production logs too, see `BACKEND.md`

---

## Troubleshooting

### Site not deploying?
- Check GitHub is up to date: `git status`
- Check Netlify deployment logs: Dashboard → **Deploys**
- Verify `netlify.toml` is in root directory

### Buttons/lists not showing?
- Hard refresh in browser: `Ctrl+Shift+R`
- Clear service worker: DevTools → Application → Clear site data
- Check `lists.json` is valid JSON

### PWA won't install?
- Must be **HTTPS** (Netlify provides this)
- Must have valid `manifest.json` (you do)
- Must have service worker (you do)
- Chrome might not show install in incognito

### Service worker not updating?
- Service worker caches aggressively
- Hard refresh to update
- Or wait 24 hours for cache expiration

---

## What's Next?

1. **Deploy now** to Netlify (follow Step 1-2 above)
2. **Test on mobile** with install/offline
3. **Update lists** by editing `lists.json` in repo
4. **(Optional)** Add backend to save logs to database (see `BACKEND.md`)

---

**Version**: 1.0.0  
**Status**: Ready for Netlify deployment  
**HTTPS**: ✅ Automatic  
**PWA**: ✅ Fully configured  
**Offline**: ✅ Works out of the box
