const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.join(__dirname, 'production-logs.db');
const db = new Database(dbPath, { readonly: true });
const rows = db.prepare('SELECT id,date,shift,operator,machine,operation,qty,jobCardNo,srNo,description,startTime,endTime,duration,remark1,remark2,createdAt FROM logs ORDER BY createdAt DESC LIMIT 5').all();
console.log(rows);
