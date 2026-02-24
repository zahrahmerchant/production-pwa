// review.js - Handles review page logic for viewing, editing, deleting, and submitting logs

// Helper: get current date/shift from localStorage prefs
function getCurrentPrefs() {
    try {
        const raw = localStorage.getItem('prodlog_prefs');
        if (!raw) return null;
        return JSON.parse(raw);
    } catch (e) {
        return null;
    }
}

// Helper: get logs for current date/shift
function getCurrentLogs() {
    const prefs = getCurrentPrefs();
    if (!prefs || !prefs.date || !prefs.shift) return [];
    const key = `prodlog_entries_${prefs.date}_${prefs.shift}`;
    try {
        return JSON.parse(localStorage.getItem(key)) || [];
    } catch (e) {
        return [];
    }
}

// Helper: save logs for current date/shift
function saveCurrentLogs(logs) {
    const prefs = getCurrentPrefs();
    if (!prefs || !prefs.date || !prefs.shift) return;
    const key = `prodlog_entries_${prefs.date}_${prefs.shift}`;
    localStorage.setItem(key, JSON.stringify(logs));
}

// Render logs in the reviewContent div
function renderLogs() {
    const logs = getCurrentLogs();
    const container = document.getElementById('reviewContent');
    if (!container) return;
    if (!logs.length) {
        container.innerHTML = '<p>No logs saved for this shift.</p>';
        return;
    }
    let table = `<table class="review-table">
        <thead>
            <tr>
                <th>JC No</th><th>Operator</th><th>Machine</th><th>Action</th>
            </tr>
        </thead>
        <tbody>`;
    logs.forEach((log, idx) => {
        table += `<tr>
            <td>${log.jobCardNo}</td>
            <td>${log.operator}</td>
            <td>${log.machine}</td>
            <td><button class="edit-btn" onclick="editLog(${idx})">Edit</button></td>
        </tr>`;
    });
    table += '</tbody></table>';
    container.innerHTML = table;
}

// Edit log: populate main form and go back to main page
function editLog(idx) {
    const logs = getCurrentLogs();
    if (!logs[idx]) return;
    localStorage.setItem('prodlog_edit_idx', idx); // mark which log to edit
    window.location.href = 'index.html?edit=1';
}

// Delete log
function deleteLog(idx) {
    let logs = getCurrentLogs();
    if (!logs[idx]) return;
    if (!confirm('Delete this log?')) return;
    logs.splice(idx, 1);
    saveCurrentLogs(logs);
    renderLogs();
}

// Submit all logs to backend
function submitAllLogs() {
    const logs = getCurrentLogs();
    if (!logs.length) return;
    const btn = document.getElementById('submitAllBtn');
    if (btn) btn.disabled = true;
    // Use the same API base as the main app
    const API_BASE = window.__API_BASE__ || '';
    const backendUrl = API_BASE ? `${API_BASE}/api/logs/batch` : '/api/logs/batch';
    fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logs })
    })
        .then(async r => {
            let result;
            let text = await r.text();
            try {
                result = JSON.parse(text);
            } catch (e) {
                // Not JSON, show raw response
                alert('Server returned non-JSON response:\n' + text);
                throw new Error('Non-JSON response');
            }
            if (result.success) {
                // Remove logs from localStorage
                const prefs = getCurrentPrefs();
                if (prefs && prefs.date && prefs.shift) {
                    const key = `prodlog_entries_${prefs.date}_${prefs.shift}`;
                    localStorage.removeItem(key);
                }
                // Clear saved prefs so next open defaults to today's date/shift unset
                localStorage.removeItem('prodlog_prefs');
                localStorage.removeItem('prodlog_edit_idx');
                alert('✓ All logs submitted successfully!');
                renderLogs();
            } else {
                alert('Error: ' + (result.error || JSON.stringify(result)));
            }
        })
        .catch(err => {
            alert('Could not submit logs: ' + err.message);
        })
        .finally(() => {
            if (btn) btn.disabled = false;
        });
}

document.addEventListener('DOMContentLoaded', renderLogs);
