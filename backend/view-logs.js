// backend/view-logs.js
// View production logs from the database
const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'production-logs.db'));

console.log('\n╔════════════════════════════════════════════════════════════════╗');
console.log('║          PRODUCTION LOG DATABASE VIEWER                        ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

// Get all logs
const logs = db.prepare('SELECT * FROM logs ORDER BY createdAt DESC').all();

if (logs.length === 0) {
    console.log('❌ No logs found in database yet.\n');
    console.log('   Tip: Open http://localhost:8080 and save a production log first!\n');
} else {
    console.log(`✅ Found ${logs.length} log(s)\n`);

    // Display in table format
    console.log('RECENT LOGS:');
    console.log('─'.repeat(120));

    logs.slice(0, 5).forEach((log, index) => {
        console.log(`\n[${index + 1}] ID: ${log.id}`);
        console.log(`    Date: ${log.date} | Shift: ${log.shift}`);
        console.log(`    Operator: ${log.operator} | Machine: ${log.machine}`);
        console.log(`    Operation: ${log.operation} | Quantity: ${log.qty}`);
        console.log(`    Job Card: ${log.jobCardNo} | Description: ${log.description}`);
        console.log(`    Duration: ${log.duration} hrs | Saved: ${log.createdAt}`);
        if (log.remark1 || log.remark2) {
            console.log(`    Remarks: ${[log.remark1, log.remark2].filter(Boolean).join(' | ')}`);
        }
    });

    console.log('\n' + '─'.repeat(120));

    // Get statistics
    const stats = db.prepare(`
        SELECT 
            COUNT(*) as totalEntries,
            SUM(qty) as totalQty,
            GROUP_CONCAT(DISTINCT operator) as operators,
            GROUP_CONCAT(DISTINCT machine) as machines
        FROM logs
    `).get();

    console.log('\nSTATISTICS:');
    console.log(`  Total Entries: ${stats.totalEntries}`);
    console.log(`  Total Quantity: ${stats.totalQty || 0}`);
    console.log(`  Unique Operators: ${stats.operators ? stats.operators.split(',').length : 0}`);
    console.log(`  Unique Machines: ${stats.machines ? stats.machines.split(',').length : 0}`);

    // Top operators
    const topOps = db.prepare(`
        SELECT operator, COUNT(*) as count 
        FROM logs 
        GROUP BY operator 
        ORDER BY count DESC 
        LIMIT 5
    `).all();

    if (topOps.length > 0) {
        console.log('\nTOP OPERATORS:');
        topOps.forEach(op => console.log(`  - ${op.operator}: ${op.count} entries`));
    }

    // Top machines
    const topMachines = db.prepare(`
        SELECT machine, COUNT(*) as count 
        FROM logs 
        GROUP BY machine 
        ORDER BY count DESC 
        LIMIT 5
    `).all();

    if (topMachines.length > 0) {
        console.log('\nTOP MACHINES:');
        topMachines.forEach(m => console.log(`  - ${m.machine}: ${m.count} entries`));
    }
}

// Export function
console.log('\n📤 EXPORT OPTIONS:');
console.log(`   node export-logs.js          - Export to CSV file`);
console.log(`   node export-logs.js json     - Export to JSON file\n`);

db.close();
