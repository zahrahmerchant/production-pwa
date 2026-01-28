# Backend Integration Guide

Your Production Log PWA now has a complete backend system!

## What's New

✅ **Backend Server**: Express.js + SQLite  
✅ **API Endpoints**: Save, retrieve, delete, and analyze logs  
✅ **Database**: Automatic SQLite database with schema  
✅ **Ready for Production**: Can be deployed to Railway, Heroku, or your own server  

## File Structure

```
production-pwa/
├── index.html, app.js, style.css, etc.  (Frontend PWA)
├── backend/
│   ├── server.js                        (Main backend code)
│   ├── package.json                     (Dependencies)
│   └── README.md                        (Backend docs)
├── DEPLOY_BACKEND.md                    (Railway deployment guide)
└── netlify.toml                         (Frontend config)
```

## Local Testing

### 1. Start Backend (New Terminal)

```bash
cd backend
npm install
npm start
```

Output:
```
🚀 Production Log Backend Server running on port 5000
```

### 2. Start Frontend (Another Terminal)

```bash
npm start
# Opens http://localhost:8080
```

### 3. Test the Integration

1. Open http://localhost:8080
2. Fill out the form completely
3. Click **"Save & Next"**
4. Should show: **"✓ Log saved successfully!"**
5. Form resets, ready for next entry

### 4. View Saved Logs

Open a new terminal and run:

```bash
# Get all logs
curl http://localhost:5000/api/logs

# Get today's logs
curl "http://localhost:5000/api/logs?date=2026-01-28"

# Get statistics
curl http://localhost:5000/api/stats
```

Or use the database directly:

```bash
sqlite3 backend/production-logs.db "SELECT * FROM logs;"
```

## API Endpoints

### Save Log (Used by PWA)
```
POST http://localhost:5000/api/logs
```

**Request Body:**
```json
{
  "date": "2026-01-28",
  "shift": "First",
  "operator": "John Doe",
  "machine": "CNC-01",
  "operation": "Milling",
  "qty": 10,
  "jobCardNo": "JC-12345",
  "srNo": 1,
  "description": "Sample milling operation",
  "duration": 8,
  "remark1": "Completed on time",
  "remark2": "No issues"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Log saved successfully",
  "id": "1704067200000-abc123"
}
```

### Retrieve Logs
```
GET http://localhost:5000/api/logs
GET http://localhost:5000/api/logs?date=2026-01-28
GET http://localhost:5000/api/logs?limit=50
```

### Get Statistics
```
GET http://localhost:5000/api/stats
GET http://localhost:5000/api/stats?date=2026-01-28
```

## Production Deployment

### Step 1: Deploy Frontend to Netlify (Already Done)
Your PWA is on Netlify at: `https://your-site.netlify.app`

### Step 2: Deploy Backend to Railway

1. Go to https://railway.app
2. Click **"Create New Project"** → **"Deploy from GitHub"**
3. Select your `production-pwa` repo
4. Railway detects Node.js and deploys backend
5. Get your Railway URL: `https://your-backend-xyz.railway.app`

### Step 3: Update Frontend with Backend URL

Edit `app.js` in the `save()` function:

```javascript
// Change this line:
const backendUrl = window.location.hostname === 'localhost'
    ? 'http://localhost:5000/api/logs'
    : '/api/logs';

// To this:
const backendUrl = 'https://your-backend-xyz.railway.app/api/logs';
```

### Step 4: Commit and Auto-Deploy

```bash
git add app.js
git commit -m "Update backend URL to production"
git push origin main
# Netlify auto-deploys
```

## How It All Works Together

```
┌─────────────────┐
│   User's Phone  │
│   (PWA App)     │
└────────┬────────┘
         │ HTTPS
         ▼
┌──────────────────────┐
│  Netlify (Frontend)  │
│  - index.html        │
│  - app.js            │
│  - Service Worker    │
│  - Works Offline     │
└────────┬─────────────┘
         │ HTTPS / POST to /api/logs
         ▼
┌──────────────────────┐
│ Railway (Backend)    │
│ - Express.js Server  │
│ - SQLite Database    │
│ - API Endpoints      │
└──────────────────────┘
```

## Data Flow

1. **User fills form** on PWA
2. **Clicks "Save & Next"**
3. **App validates** all fields
4. **Sends POST** to backend with JSON data
5. **Backend receives**, validates, inserts into SQLite
6. **Returns success response**
7. **App shows confirmation** and resets form
8. **User can continue** logging next entry

## Monitoring

### View Recent Logs

**From terminal:**
```bash
sqlite3 backend/production-logs.db "SELECT * FROM logs ORDER BY createdAt DESC LIMIT 5;"
```

**From API:**
```bash
curl https://your-backend-xyz.railway.app/api/logs?limit=5
```

**Export to CSV:**
```bash
sqlite3 -header -csv backend/production-logs.db "SELECT * FROM logs;" > logs.csv
# Opens in Excel
```

## Security Considerations

For production, consider adding:

✅ **Authentication**
- API key or JWT token
- Prevent unauthorized access

✅ **Rate Limiting**
- Prevent abuse/DOS attacks
- Limit logs per user per day

✅ **Input Validation**
- Sanitize all inputs
- Check data types

✅ **Database Backups**
- Regular automated backups
- Disaster recovery plan

✅ **HTTPS Everywhere**
- Netlify: automatic
- Railway: automatic
- Encrypt data in transit

✅ **Logs Retention Policy**
- Archive old logs
- Comply with data regulations

## Troubleshooting

### Logs not saving
- Backend running? Check port 5000
- Check browser console (F12) for errors
- Try curl to test API directly

### Backend crashes on startup
- Check `backend/package.json` for dependencies
- Run `npm install` in backend folder
- Check for database permission issues

### Can't connect to production backend
- Verify Railway URL is correct in app.js
- Check Railway logs for errors
- Verify CORS is enabled

## What's Next

1. ✅ Test locally (backend + frontend working together)
2. ✅ Deploy to production (Netlify + Railway)
3. Optional: Add authentication
4. Optional: Upgrade to PostgreSQL for reliability
5. Optional: Add admin dashboard to view all logs
6. Optional: Export functionality (CSV, Excel)

## Commands Reference

```bash
# Start backend locally
cd backend && npm start

# Start frontend locally
npm start

# Test API
curl http://localhost:5000/api/logs
curl http://localhost:5000/api/stats

# Query database
sqlite3 backend/production-logs.db "SELECT * FROM logs;"

# Export to CSV
sqlite3 -header -csv backend/production-logs.db "SELECT * FROM logs;" > logs.csv
```

---

**Backend Status**: ✅ Ready for testing and deployment  
**Integration**: ✅ App.js updated to use backend  
**Next**: Deploy to Railway and test end-to-end
