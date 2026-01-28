# Production Log Backend

Simple Express.js + SQLite backend for storing production logs.

## Quick Start (Local Development)

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Run the Backend

```bash
npm start
```

Server starts on `http://localhost:5000`

### 3. Test the API

```bash
# Save a log
curl -X POST http://localhost:5000/api/logs \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2026-01-28",
    "shift": "First",
    "operator": "John",
    "machine": "CNC-01",
    "operation": "Milling",
    "qty": 10,
    "jobCardNo": "JC-001",
    "description": "Test entry",
    "duration": 8
  }'

# Retrieve logs
curl http://localhost:5000/api/logs

# Get stats
curl http://localhost:5000/api/stats
```

## API Endpoints

### POST /api/logs
Save a new production log

**Request:**
```json
{
  "date": "2026-01-28",
  "shift": "First",
  "operator": "John",
  "machine": "CNC-01",
  "operation": "Milling",
  "qty": 10,
  "jobCardNo": "JC-001",
  "srNo": 1,
  "description": "Test entry",
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

### GET /api/logs
Retrieve logs (with optional filters)

**Query Parameters:**
- `date` (optional): Filter by date (YYYY-MM-DD)
- `limit` (optional): Max results (default: 100)

**Example:**
```
GET /api/logs?date=2026-01-28&limit=50
```

**Response:**
```json
{
  "success": true,
  "count": 15,
  "logs": [
    {
      "id": "1704067200000-abc123",
      "date": "2026-01-28",
      "shift": "First",
      "operator": "John",
      "machine": "CNC-01",
      "operation": "Milling",
      "qty": 10,
      "jobCardNo": "JC-001",
      "duration": 8,
      "createdAt": "2026-01-28T12:00:00Z"
    },
    ...
  ]
}
```

### GET /api/logs/:id
Get a specific log by ID

**Example:**
```
GET /api/logs/1704067200000-abc123
```

### DELETE /api/logs/:id
Delete a log by ID

**Example:**
```
DELETE /api/logs/1704067200000-abc123
```

### GET /api/stats
Get production statistics

**Query Parameters:**
- `date` (optional): Filter by date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalEntries": 42,
    "totalQuantity": 520,
    "topOperators": [
      { "operator": "John", "count": 15 },
      { "operator": "Jane", "count": 12 }
    ],
    "topMachines": [
      { "machine": "CNC-01", "count": 18 },
      { "machine": "Lathe-02", "count": 14 }
    ]
  }
}
```

### GET /api/health
Health check endpoint

**Response:**
```json
{
  "success": true,
  "message": "Backend is running",
  "timestamp": "2026-01-28T12:00:00Z"
}
```

## Database

Logs are stored in `production-logs.db` (SQLite database)

**Schema:**
```sql
CREATE TABLE logs (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  shift TEXT NOT NULL,
  operator TEXT NOT NULL,
  machine TEXT NOT NULL,
  operation TEXT NOT NULL,
  qty INTEGER NOT NULL,
  jobCardNo TEXT NOT NULL,
  srNo INTEGER,
  description TEXT NOT NULL,
  duration INTEGER NOT NULL,
  remark1 TEXT,
  remark2 TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

## Deployment Options

### Option 1: Railway (Recommended - Free)

Railway gives you free database + server hosting.

**Steps:**
1. Push backend code to GitHub (in `backend/` folder)
2. Go to **https://railway.app**
3. Click **"Create New Project"** → **"Deploy from GitHub"**
4. Select your repo
5. Select the `backend` directory
6. Set environment:
   - `NODE_ENV`: production
   - `PORT`: (auto-set)
7. Deploy!

Railway gives you a public URL like: `https://prodlog-backend-xyz.railway.app`

Then in your PWA, set:
```javascript
// In app.js, update the backendUrl
const backendUrl = 'https://prodlog-backend-xyz.railway.app/api/logs';
```

### Option 2: Heroku (Free Tier Deprecated)

Use Railway instead - better free tier.

### Option 3: Render.com

Similar to Railway, supports Node.js + databases.

### Option 4: Self-Hosted VPS

Use any VPS (DigitalOcean, Linode, etc.) with Node.js:

```bash
# On your server
git clone your-repo
cd backend
npm install
npm start

# Use systemd to keep running or PM2
npm install -g pm2
pm2 start server.js
pm2 startup
pm2 save
```

## Development Workflow

### Local Testing

**Terminal 1: Backend**
```bash
cd backend
npm start
# Runs on http://localhost:5000
```

**Terminal 2: Frontend**
```bash
npm start
# Runs on http://localhost:8080
```

Open http://localhost:8080 and test the save function.

### Production Deployment

**Frontend (PWA):**
- Push to GitHub
- Netlify auto-deploys

**Backend:**
- Push `/backend` to GitHub (or separate repo)
- Deploy to Railway/Render
- Update frontend `backendUrl` with production URL

## Monitoring

### View Logs
```bash
# SQLite query
sqlite3 production-logs.db "SELECT * FROM logs ORDER BY createdAt DESC LIMIT 10;"
```

### Export to CSV
```bash
sqlite3 -header -csv production-logs.db "SELECT * FROM logs;" > production-logs.csv
```

### Export to JSON
```bash
curl http://localhost:5000/api/logs > logs.json
```

## Troubleshooting

### "Cannot find module 'express'"
```bash
cd backend
npm install
```

### "Error: SQLITE_CANTOPEN"
Make sure `backend/` directory is writable. Check permissions:
```bash
ls -la backend/
chmod 755 backend/
```

### Backend not responding
- Check if running: `http://localhost:5000/api/health`
- Check console for errors
- Verify CORS headers in frontend requests

### Frontend can't reach backend
- **Local**: Make sure backend is running on port 5000
- **Production**: Update `backendUrl` in app.js to production domain

## Security Notes

This is a simple starter backend. For production, add:
- ✅ Authentication (API keys, JWT tokens)
- ✅ Rate limiting
- ✅ Input validation
- ✅ Database backups
- ✅ Error logging
- ✅ HTTPS enforcement
- ✅ Database encryption

---

**Version**: 1.0.0  
**Status**: Ready for deployment
