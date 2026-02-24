# **📄 README.md — Production Log PWA (LAN Hosting)**

## **Overview**

This project is a **Production Logging Application** designed for factory supervisors.

The supervisor uses a **tablet** to enter production observations using a **simple button-based UI** (PWA).  
 The data is stored locally first and then uploaded in bulk to a backend server running inside the factory LAN.

This system removes the need for:

* paper logging

* retyping into Excel later

---

# **🧩 Project Architecture (Important)**

This application has **two parts**:

---

## **1️⃣ Frontend (PWA)**

Located in the **root folder**.

Contains:

* `index.html` → main data entry screen

* `app.js` → UI logic, local saving

* `review.html` → review \+ upload screen

* `review.js` → submits logs to backend

* `style.css` → styling

* `manifest.json` → makes it installable on tablet

* `service-worker.js` → offline support & caching

* `lists.json` → operators/machines/operations list

Frontend is a **PWA (Progressive Web App)**, which means:

* it can be installed on Android tablet

* it works offline

* it behaves like a real app (home screen icon)

---

## **2️⃣ Backend (API \+ Database)**

Located in `/backend`

Contains:

* `backend/server.js` → Express backend server

* `backend/production-logs.db` → SQLite database

* `package.json` → backend dependencies

Backend responsibilities:

* accept logs submitted from review page

* store logs into SQLite

* provide stats endpoints

---

# **🌐 What is LAN Hosting?**

LAN hosting means:

The app is hosted inside the factory network (Wi-Fi / router).  
 Only devices connected to that Wi-Fi can access the app.

Example:

* Tablet is connected to factory Wi-Fi

* Server machine is connected to factory Wi-Fi

Tablet opens the app using a local hostname like:

 `https://production-log.lan`

* 

No internet is required for daily use.

---

# **🖥️ What is the "Server"?**

The "server" is simply a **computer that stays ON all the time** inside the factory.

This machine will:

* host frontend files (PWA)

* run backend Node server

* store database

It can be:

* Linux machine

* mini PC

* company server

---

# **✅ Recommended Deployment Setup (Best Practice)**

Host both frontend \+ backend on the same LAN server using **Nginx**.

### **Final URLs:**

Frontend:

`https://production-log.lan/`

Backend API:

`https://production-log.lan/api/`

This is the cleanest setup because:

* no mixed content issues

* no CORS problems

* frontend can call API using relative URLs (`/api/...`)

---

# **⚠️ HTTPS Requirement for PWA**

For a PWA to install properly on Android tablets, the app must be served over:

✅ HTTPS

If it is served only on HTTP:

* it may still open

* but install behavior can be inconsistent

* browser may block some features

So we strongly recommend HTTPS.

---

# **🚀 Deployment Steps (Linux Server)**

## **Step 1: Install Required Software**

`sudo apt update`  
`sudo apt install -y nginx git curl`

Install Node.js (LTS):

`curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -`  
`sudo apt install -y nodejs`  
`node -v`  
`npm -v`

---

## **Step 2: Clone the Project**

`cd /opt`  
`sudo git clone <REPO_URL> production-log`  
`sudo chown -R $USER:$USER /opt/production-log`

---

## **Step 3: Install Backend Dependencies**

`cd /opt/production-log/backend`  
`npm install`

---

## **Step 4: Create a Permanent Database Folder**

This ensures the database stays safe even if code is updated.

`sudo mkdir -p /var/lib/production-log`  
`sudo chown -R $USER:$USER /var/lib/production-log`

Copy database (if exists):

`cp /opt/production-log/backend/production-logs.db /var/lib/production-log/production-logs.db`

---

## **Step 5: Backend environment variables**

The backend already reads environment variables. You just need to set them in the systemd service.

Required:

`DB_PATH=/var/lib/production-log/production-logs.db`

Optional (CORS):

`ALLOWED_ORIGINS=https://production-log.lan,http://production-log.lan`

---

## **Step 6: Create systemd Service for Backend**

Create a service file:

`sudo nano /etc/systemd/system/production-log.service`

Paste:

`[Unit]`  
`Description=Production Log Backend`  
`After=network.target`

`[Service]`  
`Type=simple`  
`WorkingDirectory=/opt/production-log/backend`  
`Environment=PORT=5000`  
`Environment=DB_PATH=/var/lib/production-log/production-logs.db`  
`Environment=ALLOWED_ORIGINS=https://production-log.lan,http://production-log.lan`  
`ExecStart=/usr/bin/node server.js`  
`Restart=always`

`[Install]`  
`WantedBy=multi-user.target`

Enable and start backend:

`sudo systemctl daemon-reload`  
`sudo systemctl enable production-log`  
`sudo systemctl start production-log`  
`sudo systemctl status production-log`

Backend will now run continuously.

---

## **Step 7: Configure Nginx to Serve Frontend \+ Proxy Backend**

Create config file:

`sudo nano /etc/nginx/sites-available/production-log`

Paste:

`server {`  
    `listen 80;`  
    `server_name production-log.lan;`

    `root /opt/production-log;`  
    `index index.html;`

    `location / {`  
        `try_files $uri $uri/ /index.html;`  
    `}`

    `location /api/ {`  
        `proxy_pass http://127.0.0.1:5000;`  
        `proxy_set_header Host $host;`  
        `proxy_set_header X-Real-IP $remote_addr;`  
    `}`  
`}`

Enable config:

`sudo ln -s /etc/nginx/sites-available/production-log /etc/nginx/sites-enabled/`  
`sudo nginx -t`  
`sudo systemctl reload nginx`

At this point, frontend should be accessible via:

`http://production-log.lan`

---

# **🔒 HTTPS Setup (Required for PWA Install)**

## **Step 8: Generate Local Trusted Certificate (mkcert)**

Install mkcert:

`sudo apt install -y libnss3-tools`  
`sudo snap install mkcert`  
`mkcert -install`

Generate certificate:

`mkcert production-log.lan`

Move certificates:

`sudo mkdir -p /etc/nginx/certs`  
`sudo mv production-log.lan.pem /etc/nginx/certs/`  
`sudo mv production-log.lan-key.pem /etc/nginx/certs/`

---

## **Step 9: Update Nginx for HTTPS**

Edit nginx config:

`sudo nano /etc/nginx/sites-available/production-log`

Replace with:

`server {`  
    `listen 80;`  
    `server_name production-log.lan;`  
    `return 301 https://$host$request_uri;`  
`}`

`server {`  
    `listen 443 ssl;`  
    `server_name production-log.lan;`

    `ssl_certificate     /etc/nginx/certs/production-log.lan.pem;`  
    `ssl_certificate_key /etc/nginx/certs/production-log.lan-key.pem;`

    `root /opt/production-log;`  
    `index index.html;`

    `location / {`  
        `try_files $uri $uri/ /index.html;`  
    `}`

    `location /api/ {`  
        `proxy_pass http://127.0.0.1:5000;`  
        `proxy_set_header Host $host;`  
        `proxy_set_header X-Real-IP $remote_addr;`  
    `}`  
`}`

Reload nginx:

`sudo nginx -t`  
`sudo systemctl reload nginx`

Now the app should be available at:

`https://production-log.lan`

---

# **📱 Installing on Tablet (Supervisor)**

1. Connect tablet to factory Wi-Fi

2. Open Chrome browser

Go to:

 `https://production-log.lan`

3.   
4. Tap Chrome menu (⋮)

5. Tap **Add to Home screen**

6. Install

Now the app works like a normal installed application.

---

# **🧠 How Data Works (Important)**

## **Data Entry**

* Supervisor enters logs in the main screen.

* Logs are stored locally in the tablet using `localStorage`.

This means:

* If Wi-Fi is weak, data is not lost.

## **Review \+ Submit**

* Supervisor goes to Review screen.

* Review screen submits logs in bulk to backend using:

`POST /api/logs/batch`

Backend saves into SQLite database.

---

# **🔁 Updating the Application**

## **Updating Frontend UI**

Frontend files are served directly by Nginx. To update:

`cd /opt/production-log`  
`git pull`  
`sudo systemctl reload nginx`

⚠️ Note: PWA caches old files.  
 If UI changes are not visible, you must update cache version in:

`service-worker.js`

Example:

`const CACHE_NAME = "prod-log-v2";`

Change v2 → v3 → v4 for every update.

---

## **Updating Backend Code**

`cd /opt/production-log`  
`git pull`  
`cd backend`  
`npm install`  
`sudo systemctl restart production-log`

---

# **🛠 Useful Commands (Troubleshooting)**

Check backend status:

`sudo systemctl status production-log`

Restart backend:

`sudo systemctl restart production-log`

View backend logs:

`sudo journalctl -u production-log -f`

Test nginx config:

`sudo nginx -t`

Restart nginx:

`sudo systemctl restart nginx`

---

# **✅ Final Test Checklist**

From any laptop/tablet on Wi-Fi:

1. Open frontend:

`https://production-log.lan`

2. Check backend is reachable:

`https://production-log.lan/api/stats`

3. Install PWA on tablet.

4. Save a test log.

5. Submit from Review screen.

6. Verify record appears in database.

---

# **🔥 Important Notes**

### **1\) Avoid ngrok in production**

ngrok has been removed. Production should use LAN hosting only.

### **2\) Use same domain for frontend and backend**

Frontend and backend must be on same hostname to avoid browser restrictions.

### **3\) Root certificate must be installed on tablets**

If mkcert is used, the CA certificate must be trusted on tablets for HTTPS to work.
