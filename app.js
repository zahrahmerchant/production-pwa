let state = {
    operator: null,
    machine: null,
    operation: null,
    qty: 0,
    shift: null
};

function setShift(value) {
    document.querySelectorAll('.shift-btn')
        .forEach(b => b.classList.remove('selected'));
    document.getElementById(`shift-${value}`).classList.add('selected');
    state.shift = value;

    // Apply default times for shifts
    if (value === 'First') {
        // 6 AM to 6 PM
        startHour = 6;
        startPeriod = 'AM';
        endHour = 6;
        endPeriod = 'PM';
    } else if (value === 'Second') {
        // 6 PM to 6 AM
        startHour = 6;
        startPeriod = 'PM';
        endHour = 6;
        endPeriod = 'AM';
    }

    // Update UI hour inputs and period labels
    const sEl = document.getElementById('startHour');
    const eEl = document.getElementById('endHour');
    if (sEl) sEl.value = startHour;
    if (eEl) eEl.value = endHour;
    const sp = document.getElementById('startPeriod');
    const ep = document.getElementById('endPeriod');
    if (sp) sp.innerText = startPeriod;
    if (ep) ep.innerText = endPeriod;

    savePrefs();
}

function select(type, value) {
    const buttons = document.querySelectorAll(".scroll-grid button");
    const selectedBtn = [...buttons].find(b => b.innerText.trim() === value);

    if (!selectedBtn) return;

    if (state[type] === value) {
        // Deselect if clicking same button
        state[type] = null;
        selectedBtn.classList.remove("selected");
    } else {
        // Define categories
        const operators = ['Ramesh', 'Akbar', 'Suresh', 'Vikram', 'Manoj', 'Rajesh', 'Amit', 'Sunil', 'Karan', 'Deepak', 'Naveen'];
        const machines = ['CNC-01', 'CNC-02', 'Lathe-01', 'Lathe-02', 'Milling-01', 'Milling-02'];
        const operations = ['Milling', 'Drilling', 'Turning', 'Grinding', 'Cutting', 'Welding', 'Polishing'];

        // Deselect all buttons in the same category
        [...buttons].forEach(b => {
            const btnText = b.innerText.trim();
            let btnType = null;

            if (operators.includes(btnText)) btnType = 'operator';
            else if (machines.includes(btnText)) btnType = 'machine';
            else if (operations.includes(btnText)) btnType = 'operation';

            // If this button is in the same type, remove selected class
            if (btnType === type) {
                b.classList.remove("selected");
            }
        });

        // Select new button
        state[type] = value;
        selectedBtn.classList.add("selected");
    }
}

function changeQty(delta) {
    const input = document.getElementById("qtyInput");
    let newValue = Math.max(0, parseInt(input.value || 0) + delta);
    input.value = newValue;
    updateQty();
}

function updateQty() {
    const input = document.getElementById("qtyInput");
    state.qty = Math.max(0, parseInt(input.value || 0));
    input.value = state.qty;
}

// Persistence helpers
function savePrefs() {
    try {
        const dateEl = document.getElementById('date');
        const prefs = {
            date: dateEl ? dateEl.value : '',
            shift: state.shift,
            startHour: startHour,
            startPeriod: startPeriod,
            endHour: endHour,
            endPeriod: endPeriod
        };
        localStorage.setItem('prodlog_prefs', JSON.stringify(prefs));
    } catch (e) {
        console.warn('Could not save prefs', e);
    }
}

function loadPrefs() {
    try {
        const raw = localStorage.getItem('prodlog_prefs');
        if (!raw) return null;
        return JSON.parse(raw);
    } catch (e) {
        console.warn('Could not load prefs', e);
        return null;
    }
}

// Lists management (load from lists.json or import local JSON)
function renderList(gridId, items, type) {
    const grid = document.getElementById(gridId);
    if (!grid) return;
    grid.innerHTML = '';
    (items || []).forEach(item => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.innerText = item;
        btn.addEventListener('click', () => select(type, item));
        grid.appendChild(btn);
    });
}

function loadListsFromObject(obj) {
    // support multiple key names
    const operators = obj.operators || obj.operator || [];
    const machines = obj.machines || obj.machine || [];
    const operations = obj.operations || obj.operation || [];

    renderList('operatorGrid', operators, 'operator');
    renderList('machineGrid', machines, 'machine');
    renderList('operationGrid', operations, 'operation');
}

function reloadLists() {
    // Try network fetch first, then relative path, then cache fallback.
    console.log('reloadLists() called');
    const showError = msg => {
        console.warn(msg);
        const info = document.getElementById('listsSourceInfo');
        if (info) info.innerText = msg;
    };

    console.log('Attempting to fetch lists.json...');
    fetch('lists.json', { cache: 'no-store' })
        .then(r => {
            console.log('Fetch response:', r.status, r.ok);
            if (!r.ok) throw new Error('HTTP ' + r.status);
            return r.json();
        })
        .catch(err => {
            console.warn('fetch lists.json failed, retrying with ./lists.json', err);
            return fetch('./lists.json', { cache: 'no-store' })
                .then(r => {
                    console.log('Fetch ./lists.json response:', r.status, r.ok);
                    if (!r.ok) throw new Error('HTTP ' + r.status);
                    return r.json();
                });
        })
        .catch(err2 => {
            console.warn('both network attempts failed, trying cache', err2);
            if ('caches' in window) {
                return caches.open('prod-log').then(cache => {
                    console.log('Trying cache...');
                    return cache.match('lists.json');
                }).then(resp => {
                    console.log('Cache response:', resp);
                    if (!resp) throw err2;
                    return resp.json();
                });
            }
            throw err2;
        })
        .then(j => {
            console.log('Lists loaded successfully:', j);
            if (!j) throw new Error('No lists data');
            loadListsFromObject(j);
            const info = document.getElementById('listsSourceInfo');
            if (info) info.innerText = 'Lists loaded successfully!';
        })
        .catch(finalErr => {
            const msg = 'Could not load lists.json. Ensure the app is served over HTTP and that lists.json exists in the repo. Error: ' + (finalErr && finalErr.message ? finalErr.message : finalErr);
            console.error(msg);
            showError(msg);
        });
}

function importListsFile() {
    const f = document.getElementById('listsFile');
    if (!f || !f.files || !f.files[0]) return alert('Select a lists JSON file to import');
    const reader = new FileReader();
    reader.onload = e => {
        try {
            const j = JSON.parse(e.target.result);
            loadListsFromObject(j);
            alert('Lists imported (temporary). To make permanent, update lists.json in the repo.');
        } catch (ex) {
            alert('Invalid JSON file');
        }
    };
    reader.readAsText(f.files[0]);
}


function save() {
    if (!validateForm()) return;

    // Get duration from DOM
    const duration = parseInt(document.getElementById('duration').innerText);

    // Build log entry
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

    // Determine backend URL (development vs production)
    const backendUrl = window.location.hostname === 'localhost'
        ? 'http://localhost:5000/api/logs'
        : '/api/logs'; // Production: use same domain (Netlify Functions)

    console.log('Saving to backend:', backendUrl, logData);

    // Send to backend
    fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logData)
    })
        .then(r => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            return r.json();
        })
        .then(result => {
            if (result.success) {
                alert('✓ Log saved successfully!');
                reset();
            } else {
                alert('Error: ' + (result.error || 'Unknown error'));
            }
        })
        .catch(err => {
            console.error('Save error:', err);
            alert('Could not save log. Check console for details.\n\nError: ' + err.message);
        });
}

// Autofill today's date on load and wire up simple listeners
document.addEventListener('DOMContentLoaded', () => {
    const dateEl = document.getElementById('date');

    // load saved prefs if present
    const prefs = loadPrefs();
    if (prefs) {
        if (dateEl) dateEl.value = prefs.date || new Date().toISOString().slice(0, 10);
        if (prefs.shift) {
            // apply shift and UI
            state.shift = prefs.shift;
            const btn = document.getElementById(`shift-${prefs.shift}`);
            if (btn) btn.classList.add('selected');
        }
        if (typeof prefs.startHour !== 'undefined') startHour = parseInt(prefs.startHour, 10);
        if (typeof prefs.endHour !== 'undefined') endHour = parseInt(prefs.endHour, 10);
        if (prefs.startPeriod) startPeriod = prefs.startPeriod;
        if (prefs.endPeriod) endPeriod = prefs.endPeriod;
    } else {
        if (dateEl && !dateEl.value) dateEl.value = new Date().toISOString().slice(0, 10);
    }

    // ensure qty and hours reflect state
    updateQty();
    const startEl = document.getElementById('startHour');
    const endEl = document.getElementById('endHour');
    if (startEl) startEl.value = startHour;
    if (endEl) endEl.value = endHour;
    const sp = document.getElementById('startPeriod');
    const ep = document.getElementById('endPeriod');
    if (sp) sp.innerText = startPeriod;
    if (ep) ep.innerText = endPeriod;

    // remove inline error when user interacts and save date changes
    document.querySelectorAll('input, button, .scroll-grid').forEach(el => {
        el.addEventListener('input', () => { el.classList.remove('error'); const m = el.parentNode && el.parentNode.querySelector('.error-message'); if (m) m.remove(); if (el.id === 'date') savePrefs(); });
        el.addEventListener('click', () => { el.classList.remove('error'); const m = el.parentNode && el.parentNode.querySelector('.error-message'); if (m) m.remove(); });
    });

    // Load lists.json into grids
    reloadLists();

    // Recalculate duration while typing in hour inputs
    const startInput = document.getElementById('startHour');
    const endInput = document.getElementById('endHour');
    if (startInput) {
        startInput.addEventListener('input', () => { updateHour('start'); savePrefs(); });
        startInput.addEventListener('change', () => { updateHour('start'); savePrefs(); });
    }
    if (endInput) {
        endInput.addEventListener('input', () => { updateHour('end'); savePrefs(); });
        endInput.addEventListener('change', () => { updateHour('end'); savePrefs(); });
    }
});

function reset() {
    // Clear state
    state.operator = null;
    state.machine = null;
    state.operation = null;
    state.qty = 0;
    // Preserve date, shift and time — only clear entry fields
    // Clear quantity and related state/UI
    document.getElementById("qtyInput").value = "0";
    state.qty = 0;

    // Deselect operator/machine/operation buttons only
    document.querySelectorAll('.scroll-grid button').forEach(btn => btn.classList.remove('selected'));

    // Clear job card and description fields
    ['jobCardNo', 'srNo', 'description', 'remark1', 'remark2'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });

    // Clear validation markers
    clearValidation();
}

let startHour = 6;
let endHour = 6;
let startPeriod = "AM";
let endPeriod = "PM";


function normalizeHour(h) {
    if (h < 1) return 12;
    if (h > 12) return 1;
    return h;
}

function changeHour(type, delta) {
    if (type === "start") {
        startHour = normalizeHour(startHour + delta);
        const el = document.getElementById("startHour");
        if (el) el.value = startHour;
    } else {
        endHour = normalizeHour(endHour + delta);
        const el = document.getElementById("endHour");
        if (el) el.value = endHour;
    }
    calculateDuration();
    savePrefs();
}

function updateHour(type) {
    const id = type === 'start' ? 'startHour' : 'endHour';
    const el = document.getElementById(id);
    if (!el) return;
    let v = parseInt(el.value);
    if (isNaN(v)) v = type === 'start' ? startHour : endHour;
    v = Math.max(1, Math.min(12, v));
    el.value = v;
    if (type === 'start') startHour = v; else endHour = v;
    calculateDuration();
    savePrefs();
}

function togglePeriod(type) {
    if (type === "start") {
        startPeriod = startPeriod === "AM" ? "PM" : "AM";
        document.getElementById("startPeriod").innerText = startPeriod;
    } else {
        endPeriod = endPeriod === "AM" ? "PM" : "AM";
        document.getElementById("endPeriod").innerText = endPeriod;
    }
    calculateDuration();
    savePrefs();
}

function to24(hour, period) {
    if (period === "AM") return hour === 12 ? 0 : hour;
    return hour === 12 ? 12 : hour + 12;
}

function calculateDuration() {
    const s = to24(startHour, startPeriod);
    const e = to24(endHour, endPeriod);

    let diff = e - s;
    if (diff < 0) diff += 24; // cross-midnight

    document.getElementById("duration").innerText = diff;
}

function validateForm() {
    clearValidation();

    const dateEl = document.getElementById("date");
    const jobCardEl = document.getElementById("jobCardNo");
    const descEl = document.getElementById("description");
    const qtyEl = document.getElementById("qtyInput");

    let valid = true;

    if (!dateEl.value) {
        showError(dateEl, "Date is required");
        valid = false;
    }

    if (!state.shift) {
        const shiftContainer = document.querySelector('.row');
        showError(shiftContainer, "Shift must be selected");
        valid = false;
    }

    if (!state.operator) {
        const op = document.getElementById('operatorGrid');
        showError(op, "Operator must be selected");
        valid = false;
    }

    if (!state.machine) {
        const mg = document.getElementById('machineGrid');
        showError(mg, "Machine must be selected");
        valid = false;
    }

    if (!state.operation) {
        const og = document.getElementById('operationGrid');
        showError(og, "Operation must be selected");
        valid = false;
    }

    if (!qtyEl.value || parseInt(qtyEl.value) === 0) {
        showError(qtyEl, "Quantity must be greater than 0");
        valid = false;
    }

    if (!jobCardEl.value) {
        showError(jobCardEl, "Job Card No is required");
        valid = false;
    }

    if (!descEl.value) {
        showError(descEl, "Description is required");
        valid = false;
    }

    return valid;
}

function clearValidation() {
    // remove error classes and messages
    document.querySelectorAll('.error-message').forEach(n => n.remove());
    document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
}

function showError(target, message) {
    if (!target) return;
    // if target is input or element, add error class
    target.classList.add('error');
    const msg = document.createElement('div');
    msg.className = 'error-message';
    msg.innerText = message;
    // place message after the element if possible
    if (target.nextSibling) target.parentNode.insertBefore(msg, target.nextSibling);
    else target.parentNode.appendChild(msg);
}



