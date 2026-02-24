// backend/server.js
// Production Log Backend Server
// Handles saving and retrieving production logs

const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// CORS configuration
// Set ALLOWED_ORIGINS env var to a comma-separated list, e.g.
// https://production-log.lan,http://production-log.lan
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

app.use(cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : [
        'https://production-log.lan',
        'http://production-log.lan'
    ]
}));

// Initialize SQLite database
const dbPath = process.env.DB_PATH || path.join(__dirname, 'production-logs.db');
const db = new Database(dbPath);

// Create table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS logs (
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
    startTime TEXT,
    endTime TEXT,
    duration INTEGER NOT NULL,
    remark1 TEXT,
    remark2 TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

console.log('Database initialized at:', dbPath);

// ============= API ENDPOINTS =============

// POST /api/logs/batch: Accepts { logs: [...] } and inserts into SQLite logs table
app.post('/api/logs/batch', (req, res) => {
    const logs = req.body.logs;
    if (!Array.isArray(logs)) {
        return res.status(400).json({ success: false, error: 'Missing or invalid logs array' });
    }
    const stmt = db.prepare(`
        INSERT INTO logs (id, date, shift, operator, machine, operation, qty, jobCardNo, srNo, description, startTime, endTime, duration, remark1, remark2)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    let inserted = 0;
    const errors = [];
    for (const log of logs) {
        try {
            // Generate a unique id for each log if not present
            const id = log.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            stmt.run(
                id,
                log.date,
                log.shift,
                log.operator,
                log.machine,
                log.operation,
                log.qty,
                log.jobCardNo,
                log.srNo || null,
                log.description,
                log.startTime || null,
                log.endTime || null,
                log.duration,
                log.remark1 || null,
                log.remark2 || null
            );
            inserted++;
        } catch (e) {
            errors.push({ log, error: e.message });
        }
    }
    if (errors.length) {
        return res.status(500).json({ success: false, inserted, errors });
    }
    res.json({ success: true, inserted });
});

// POST /api/logs - Save a new log entry
app.post('/api/logs', (req, res) => {
    try {
        const { date, shift, operator, machine, operation, qty, jobCardNo, srNo, description, startTime, endTime, duration, remark1, remark2 } = req.body;

        // Validate required fields
        if (!date || !shift || !operator || !machine || !operation || !qty || !jobCardNo || !description || duration === undefined) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        // Generate unique ID
        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Insert into database
        const stmt = db.prepare(`
            INSERT INTO logs (id, date, shift, operator, machine, operation, qty, jobCardNo, srNo, description, startTime, endTime, duration, remark1, remark2)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run(id, date, shift, operator, machine, operation, qty, jobCardNo, srNo || null, description, startTime || null, endTime || null, duration, remark1 || null, remark2 || null);

        res.status(201).json({
            success: true,
            message: 'Log saved successfully',
            id: id
        });

    } catch (error) {
        console.error('Error saving log:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to save log',
            details: error.message
        });
    }
});

// GET /api/logs - Retrieve logs
app.get('/api/logs', (req, res) => {
    try {
        const { date, limit = 100 } = req.query;

        let query = 'SELECT * FROM logs';
        const params = [];

        if (date) {
            query += ' WHERE date = ?';
            params.push(date);
        }

        query += ' ORDER BY createdAt DESC LIMIT ?';
        params.push(parseInt(limit) || 100);

        const stmt = db.prepare(query);
        const logs = stmt.all(...params);

        res.status(200).json({
            success: true,
            count: logs.length,
            logs: logs
        });

    } catch (error) {
        console.error('Error retrieving logs:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve logs',
            details: error.message
        });
    }
});

// GET /api/logs/:id - Get a specific log
app.get('/api/logs/:id', (req, res) => {
    try {
        const { id } = req.params;

        const stmt = db.prepare('SELECT * FROM logs WHERE id = ?');
        const log = stmt.get(id);

        if (!log) {
            return res.status(404).json({
                success: false,
                error: 'Log not found'
            });
        }

        res.status(200).json({
            success: true,
            log: log
        });

    } catch (error) {
        console.error('Error retrieving log:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve log'
        });
    }
});

// DELETE /api/logs/:id - Delete a log
app.delete('/api/logs/:id', (req, res) => {
    try {
        const { id } = req.params;

        const stmt = db.prepare('DELETE FROM logs WHERE id = ?');
        const result = stmt.run(id);

        if (result.changes === 0) {
            return res.status(404).json({
                success: false,
                error: 'Log not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Log deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting log:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete log'
        });
    }
});

// GET /api/stats - Get statistics
app.get('/api/stats', (req, res) => {
    try {
        const { date } = req.query;

        let whereClause = '';
        const params = [];

        if (date) {
            whereClause = 'WHERE date = ?';
            params.push(date);
        }

        const totalStmt = db.prepare(`SELECT COUNT(*) as count FROM logs ${whereClause}`);
        const total = totalStmt.get(...params).count;

        const qtyStmt = db.prepare(`SELECT SUM(qty) as total FROM logs ${whereClause}`);
        const totalQty = qtyStmt.get(...params).total || 0;

        const operatorStmt = db.prepare(`SELECT operator, COUNT(*) as count FROM logs ${whereClause} GROUP BY operator ORDER BY count DESC`);
        const topOperators = operatorStmt.all(...params);

        const machineStmt = db.prepare(`SELECT machine, COUNT(*) as count FROM logs ${whereClause} GROUP BY machine ORDER BY count DESC`);
        const topMachines = machineStmt.all(...params);

        res.status(200).json({
            success: true,
            stats: {
                totalEntries: total,
                totalQuantity: totalQty,
                topOperators: topOperators.slice(0, 5),
                topMachines: topMachines.slice(0, 5)
            }
        });

    } catch (error) {
        console.error('Error getting stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get statistics'
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Backend is running',
        timestamp: new Date().toISOString()
    });
});

// GET /api/frequency - Get frequency of operators, machines, operations for sorting
app.get('/api/frequency', (req, res) => {
    try {
        // Get operator frequencies
        const operatorFreq = db.prepare(`
            SELECT operator, COUNT(*) as freq FROM logs GROUP BY operator ORDER BY freq DESC
        `).all();

        // Get machine frequencies
        const machineFreq = db.prepare(`
            SELECT machine, COUNT(*) as freq FROM logs GROUP BY machine ORDER BY freq DESC
        `).all();

        // Get operation frequencies
        const operationFreq = db.prepare(`
            SELECT operation, COUNT(*) as freq FROM logs GROUP BY operation ORDER BY freq DESC
        `).all();

        // Build maps for quick lookup
        const operatorMap = {};
        const machineMap = {};
        const operationMap = {};

        operatorFreq.forEach(item => { operatorMap[item.operator] = item.freq; });
        machineFreq.forEach(item => { machineMap[item.machine] = item.freq; });
        operationFreq.forEach(item => { operationMap[item.operation] = item.freq; });

        res.status(200).json({
            success: true,
            frequency: {
                operators: operatorMap,
                machines: machineMap,
                operations: operationMap
            }
        });

    } catch (error) {
        console.error('Error getting frequency:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get frequency data'
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 Production Log Backend Server running on port ${PORT}`);
    console.log(`📊 Database: ${dbPath}`);
    console.log(`\nAPI Endpoints:`);
    console.log(`  POST   /api/logs          - Save a new log`);
    console.log(`  GET    /api/logs          - Retrieve all logs`);
    console.log(`  GET    /api/logs/:id      - Get specific log`);
    console.log(`  DELETE /api/logs/:id      - Delete a log`);
    console.log(`  GET    /api/stats         - Get statistics`);
    console.log(`  GET    /api/frequency     - Get frequency data (for sorting lists)`);
    console.log(`  GET    /api/health        - Health check\n`);
});
