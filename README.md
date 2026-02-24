First PWA

# Daily Production Log - Progressive Web App

A progressive web app for tracking production activities, operators, machines, and operations with offline support.

## Features

✅ **Offline-First**: Works completely offline after first visit  
✅ **Installable**: Add to home screen on mobile/desktop  
✅ **Fast**: Instant load with service worker caching  
✅ **Responsive**: Optimized for mobile and desktop  
✅ **Real-time Lists**: Load operators, machines, and operations from `lists.json`  
✅ **Local Storage**: Remembers your shift, date, and time preferences  

## How It Works

### Development
```bash
npm start  # or node server.js
```
Open http://localhost:8080 (must be HTTP/HTTPS, not file://)

### First Visit
1. App loads and service worker registers
2. All files are cached (~200KB)
3. App becomes installable

### Offline Mode
1. Works without internet after first visit
2. Uses cached files for instant load
3. `lists.json` uses network-first (tries fresh, falls back to cache)
4. All UI functionality works offline

## Testing PWA Features

### Install to Home Screen
**Mobile**: Open in browser → Menu → "Add to Home Screen"  
**Desktop (Chrome)**: Click install icon in address bar

### Test Offline
1. Open DevTools (F12)
2. Go to Application tab
3. Check "Offline" box
4. App continues working!

## Managing Lists
Edit `lists.json` to update operators/machines/operations. The app auto-loads on next refresh.

## Production Deployment

### LAN Hosting (Recommended)
See `README (LAN HOSTING).md` for the complete on-site setup.

## Key Files

- `index.html` - UI
- `app.js` - Logic & state
- `style.css` - Responsive styles
- `manifest.json` - PWA metadata (installable)
- `service-worker.js` - Offline caching engine
- `lists.json` - Operators, machines, operations
- `server.js` - HTTP server (required!)
- `package.json` - Dependencies

## Important: MUST Serve Over HTTP

The app **requires HTTP/HTTPS** to work as a PWA. Opening as `file://` won't work because:
- Service workers need secure context
- Fetch API can't access local files
- PWA features are disabled

**Always use**: http://localhost:8080 (dev) or https://your-domain.com (production)

## Troubleshooting

**Buttons not showing?**
- Check you're on http://localhost:8080, not file://
- Look at browser console (F12) for errors
- Verify lists.json exists

**Service worker not caching?**
- Clear cache: DevTools → Application → Clear site data
- Hard refresh: Ctrl+Shift+R

**Want to save data to a server?**
- The `save()` function currently shows a prototype alert
- To add backend, modify `app.js` to POST to an API endpoint
- See backend docs for Express/Node setup

---

**Version**: 1.0.0  
**Status**: Production-ready PWA
