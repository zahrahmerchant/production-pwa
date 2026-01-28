# Deploy Backend to Railway

Railway is the easiest way to host your backend. Free tier includes database storage.

## Step 1: Prepare Your Code

Make sure your repo structure is:
```
production-pwa/
├── index.html
├── app.js
├── style.css
├── manifest.json
├── service-worker.js
├── lists.json
├── netlify.toml
├── package.json
├── README.md
└── backend/                 ← Your backend code
    ├── server.js
    ├── package.json
    └── README.md
```

Commit everything:
```bash
git add .
git commit -m "Add backend server"
git push origin main
```

## Step 2: Create Railway Project

1. Go to **https://railway.app**
2. Click **"Create New Project"** (or **"New"**)
3. Click **"Deploy from GitHub"**
4. Authorize Railway to access your GitHub
5. Select your `production-pwa` repository
6. Railway scans your repo automatically

## Step 3: Configure Backend

Railway should auto-detect Node.js:
1. Select **Node.js** as the runtime
2. Click **"Deploy"**

This creates a Railway project and deploys your backend!

## Step 4: Get Your Backend URL

1. After deployment, Railway shows a URL like:
   ```
   https://prodlog-backend-xyz.railway.app
   ```
2. Copy this URL

## Step 5: Update Your Frontend

In your **app.js**, update the backend URL:

```javascript
function save() {
    if (!validateForm()) return;

    const duration = parseInt(document.getElementById('duration').innerText);

    const logData = {
        date: document.getElementById('date').value,
        shift: state.shift,
        operator: state.operator,
        machine: state.machine,
        operation: state.operation,
        qty: parseInt(document.getElementById('qtyInput').value),
        jobCardNo: document.getElementById('jobCardNo').value,
        srNo: document.getElementById('srNo').value ? parseInt(document.getElementById('srNo').value) : null,
        description: document.getElementById('description').value,
        duration: duration,
        remark1: document.getElementById('remark1').value || '',
        remark2: document.getElementById('remark2').value || ''
    };

    // UPDATE THIS URL with your Railway backend URL
    const backendUrl = 'https://your-railway-url.railway.app/api/logs';

    fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logData)
    })
    .then(r => r.json())
    .then(result => {
        if (result.success) {
            alert('✓ Log saved successfully!');
            reset();
        } else {
            alert('Error: ' + result.error);
        }
    })
    .catch(err => {
        console.error('Save error:', err);
        alert('Could not save log:\n\n' + err.message);
    });
}
```

Replace `https://your-railway-url.railway.app` with your actual Railway URL.

## Step 6: Commit and Deploy

```bash
# Edit app.js with your Railway URL
# Then:
git add app.js
git commit -m "Update backend URL to Railway"
git push origin main
```

Netlify auto-deploys your frontend with the new backend URL!

## Step 7: Test

1. Open your Netlify PWA URL
2. Fill out the form
3. Click "Save & Next"
4. Check that it says "Log saved successfully!"

## Monitoring Your Backend

### View Logs in Railway

1. Go to your Railway project
2. Click **"Logs"** tab
3. See all server logs in real-time

### Query Your Database

In Railway dashboard:
1. Click **"Data"** (if you added a database)
2. Or SSH into your backend and run:
   ```bash
   sqlite3 production-logs.db "SELECT * FROM logs ORDER BY createdAt DESC LIMIT 10;"
   ```

## API Endpoints

Your backend now has these endpoints:

```
POST   https://your-url.railway.app/api/logs          - Save a log
GET    https://your-url.railway.app/api/logs          - Get all logs
GET    https://your-url.railway.app/api/logs/:id      - Get specific log
DELETE https://your-url.railway.app/api/logs/:id      - Delete a log
GET    https://your-url.railway.app/api/stats         - Get statistics
GET    https://your-url.railway.app/api/health        - Health check
```

Test with curl:
```bash
# Get all logs
curl https://your-url.railway.app/api/logs

# Get today's logs
curl "https://your-url.railway.app/api/logs?date=2026-01-28"

# Get stats
curl https://your-url.railway.app/api/stats

# Health check
curl https://your-url.railway.app/api/health
```

## Troubleshooting

### "Failed to save log" error
- Check your Railway URL is correct in app.js
- Check Railway backend is running (view logs)
- Check browser console (F12) for error details
- Verify CORS is enabled (should be in server.js)

### Backend not starting
- Go to Railway dashboard
- Check **Logs** tab for error messages
- Common issues:
  - Port conflict: Railway should set PORT automatically
  - Missing node_modules: Check `backend/package.json` has dependencies listed

### "Cannot find module 'express'"
- Railway should auto-run `npm install` during build
- Check build logs in Railway dashboard

### Database file not found
- Railway uses `/tmp` for temp files, which gets cleared
- For production, upgrade to Railway's PostgreSQL database:
  1. In Railway dashboard, click **"Add"**
  2. Select **"PostgreSQL"**
  3. Update `server.js` to use PostgreSQL instead of SQLite
  - Or keep SQLite but data clears on redeploys

## Next Steps

### Option A: Keep Data Persistent
Upgrade Railway to PostgreSQL:
1. Add PostgreSQL database in Railway
2. Update backend to use PostgreSQL
3. Data persists across redeploys

### Option B: Cloud Storage
Use AWS S3 or similar to back up database file

### Option C: Keep as-is
SQLite is fine for testing. Add production database when needed.

## Useful Railway Links

- Dashboard: https://railway.app
- Docs: https://docs.railway.app
- Environment variables: https://docs.railway.app/deploy/environment-variables
- Custom domains: https://docs.railway.app/develop/domains

---

**Status**: Backend deployed to Railway ✓  
**Frontend**: Netlify PWA  
**Database**: SQLite (in `/tmp`, persists until redeploy)
