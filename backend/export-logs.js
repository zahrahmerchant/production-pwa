// backend/export-logs.js
// Export production logs to CSV or JSON
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const db = new Database(path.join(__dirname, 'production-logs.db'));
const format = process.argv[2] || 'csv'; // Default to CSV

const logs = db.prepare('SELECT * FROM logs ORDER BY createdAt DESC').all();

if (logs.length === 0) {
    console.log('❌ No logs to export.');
    db.close();
    process.exit(0);
}

if (format === 'json') {
    // Export as JSON
    const filename = `production-logs-${new Date().toISOString().split('T')[0]}.json`;
    fs.writeFileSync(filename, JSON.stringify(logs, null, 2));
    console.log(`✅ Exported ${logs.length} logs to ${filename}`);
} else {
    // Export as CSV (default)
    const filename = `production-logs-${new Date().toISOString().split('T')[0]}.csv`;

    // CSV headers
    const headers = Object.keys(logs[0]).join(',');

    // CSV rows
    const rows = logs.map(log => {
        return Object.values(log).map(val => {
            // Escape quotes in strings
            if (typeof val === 'string' && (val.includes(',') || val.includes('"'))) {
                return `"${val.replace(/"/g, '""')}"`;
            }
            return val;
        }).join(',');
    });

    const csv = [headers, ...rows].join('\n');
    fs.writeFileSync(filename, csv);
    console.log(`✅ Exported ${logs.length} logs to ${filename}`);
    console.log(`   Open in Excel or Google Sheets to view`);
}

db.close();
