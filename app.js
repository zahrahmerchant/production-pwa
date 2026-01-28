// ============================================================
// Production Log PWA - Main Application Logic
// ============================================================

// Global state
let state = {
    operator: null,
    machine: null,
    operation: null,
    qty: 0,
    shift: null
};

// Time state
let startHour = 6;
let endHour = 6;
let startPeriod = 'AM';
let endPeriod = 'PM';

// Frequency map for sorting lists by usage
let frequencyMap = {
    operators: {},
    machines: {},
    operations: {}
};

// ============================================================
// TIME CALCULATIONS
// ============================================================

/**
 * Convert 12-hour format to 24-hour format
 */
function to24(hour, period) {
    if (period === 'AM') {
        return hour === 12 ? 0 : hour;
    }
    return hour === 12 ? 12 : hour + 12;
}

/**
 * Calculate duration in hours between start and end time
 */
function calculateDuration() {
    const startHour24 = to24(startHour, startPeriod);
    const endHour24 = to24(endHour, endPeriod);

    let duration = endHour24 - startHour24;

    if (duration < 0) {
        duration += 24;
    }
    if (duration === 0) {
        duration = 24;
    }

    const durationEl = document.getElementById('duration');
    if (durationEl) {
        durationEl.innerText = duration;
    }
}

/**
 * Normalize hour to 1-12 range
 */
function normalizeHour(h) {
    if (h < 1) return 12;
    if (h > 12) return 1;
    return h;
}

/**
 * Change start or end hour by delta (+/-)
 */
function changeHour(type, delta) {
    if (type === 'start') {
        startHour = normalizeHour(startHour + delta);
        const el = document.getElementById('startHour');
        if (el) el.value = startHour;
    } else {
        endHour = normalizeHour(endHour + delta);
        const el = document.getElementById('endHour');
        if (el) el.value = endHour;
    }
    calculateDuration();
    savePrefs();
}

/**
 * Update hour from input field value
 */
function updateHour(type) {
    const inputId = type === 'start' ? 'startHour' : 'endHour';
    const el = document.getElementById(inputId);
    if (!el) return;

    let value = parseInt(el.value);
    if (isNaN(value)) {
        value = type === 'start' ? startHour : endHour;
    }

    value = Math.max(1, Math.min(12, value));
    el.value = value;

    if (type === 'start') {
        startHour = value;
    } else {
        endHour = value;
    }

    calculateDuration();
    savePrefs();
}

/**
 * Toggle AM/PM for start or end time
 */
function togglePeriod(type) {
    if (type === 'start') {
        startPeriod = startPeriod === 'AM' ? 'PM' : 'AM';
        const el = document.getElementById('startPeriod');
        if (el) el.innerText = startPeriod;
    } else {
        endPeriod = endPeriod === 'AM' ? 'PM' : 'AM';
        const el = document.getElementById('endPeriod');
        if (el) el.innerText = endPeriod;
    }
    calculateDuration();
    savePrefs();
}

/**
 * Set shift and apply default times
 */
function setShift(value) {
    document.querySelectorAll('.shift-btn').forEach(btn => {
        btn.classList.remove('selected');
    });

    const btn = document.getElementById(`shift-${value}`);
    if (btn) btn.classList.add('selected');

    state.shift = value;

    if (value === 'First') {
        startHour = 6;
        startPeriod = 'AM';
        endHour = 6;
        endPeriod = 'PM';
    } else if (value === 'Second') {
        startHour = 6;
        startPeriod = 'PM';
        endHour = 6;
        endPeriod = 'AM';
    }

    const startHourEl = document.getElementById('startHour');
    const endHourEl = document.getElementById('endHour');
    if (startHourEl) startHourEl.value = startHour;
    if (endHourEl) endHourEl.value = endHour;

    const startPeriodEl = document.getElementById('startPeriod');
    const endPeriodEl = document.getElementById('endPeriod');
    if (startPeriodEl) startPeriodEl.innerText = startPeriod;
    if (endPeriodEl) endPeriodEl.innerText = endPeriod;

    calculateDuration();
    savePrefs();
}

// ============================================================
// QUANTITY
// ============================================================

function changeQty(delta) {
    const input = document.getElementById('qtyInput');
    let value = Math.max(0, parseInt(input.value || 0) + delta);
    input.value = value;
    state.qty = value;
}

function updateQty() {
    const input = document.getElementById('qtyInput');
    state.qty = Math.max(0, parseInt(input.value || 0));
    input.value = state.qty;
}

// ============================================================
// SELECTION (Operator, Machine, Operation)
// ============================================================

function select(type, value) {
    const gridId = type === 'operator' ? 'operatorGrid'
        : type === 'machine' ? 'machineGrid'
            : 'operationGrid';
    const grid = document.getElementById(gridId);
    if (!grid) return;

    const buttons = Array.from(grid.querySelectorAll('button'));
    const selectedBtn = buttons.find(b => b.innerText.trim() === value);
    if (!selectedBtn) return;

    if (state[type] === value) {
        state[type] = null;
        selectedBtn.classList.remove('selected');
        return;
    }

    buttons.forEach(b => b.classList.remove('selected'));

    state[type] = value;
    selectedBtn.classList.add('selected');
}

// ============================================================
// LISTS & RENDERING
// ============================================================

function renderList(gridId, items, type) {
    const grid = document.getElementById(gridId);
    if (!grid) return;

    grid.innerHTML = '';

    const sortedItems = (items || []).sort((a, b) => {
        const freqKey = type === 'operator' ? 'operators'
            : type === 'machine' ? 'machines'
                : 'operations';
        const freqA = frequencyMap[freqKey] && frequencyMap[freqKey][a] || 0;
        const freqB = frequencyMap[freqKey] && frequencyMap[freqKey][b] || 0;

        if (freqB !== freqA) return freqB - freqA;
        return a.localeCompare(b);
    });

    sortedItems.forEach(item => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.innerText = item;
        btn.addEventListener('click', () => select(type, item));

        if (state[type] === item) {
            btn.classList.add('selected');
        }

        grid.appendChild(btn);
    });
}

function loadListsFromObject(obj) {
    const operators = obj.operators || obj.operator || [];
    const machines = obj.machines || obj.machine || [];
    const operations = obj.operations || obj.operation || [];


    renderList('operatorGrid', operators, 'operator');
    renderList('machineGrid', machines, 'machine');
    renderList('operationGrid', operations, 'operation');
}

function reloadLists() {
    fetch('lists.json', { cache: 'no-store' })
        .then(r => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            return r.json();
        })
        .catch(err => {
            return fetch('./lists.json', { cache: 'no-store' })
                .then(r => {
                    if (!r.ok) throw new Error(`HTTP ${r.status}`);
                    return r.json();
                })
                .catch(() => {
                    if ('caches' in window) {
                        return caches.open('prod-log')
                            .then(cache => cache.match('lists.json'))
                            .then(resp => {
                                if (!resp) throw new Error('Not in cache');
                                return resp.json();
                            });
                    }
                    throw err;
                });
        })
        .then(data => {
            loadListsFromObject(data);
        })
        .catch(err => {
            console.error('Failed to load lists.json:', err);
        });
}

function loadFrequencyData() {
    const backendUrl = window.location.hostname === 'localhost'
        ? 'http://localhost:5000/api/frequency'
        : '/api/frequency';

    fetch(backendUrl)
        .then(r => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            return r.json();
        })
        .then(data => {
            if (data.success && data.frequency) {
                frequencyMap = data.frequency;
                reloadLists();
            }
        })
        .catch(err => {
            console.warn('Frequency data not available:', err);
        });
}

// ============================================================
// PERSISTENCE
// ============================================================

function savePrefs() {
    try {
        const dateEl = document.getElementById('date');
        const prefs = {
            date: dateEl ? dateEl.value : '',
            shift: state.shift,
            startHour,
            startPeriod,
            endHour,
            endPeriod
        };
        localStorage.setItem('prodlog_prefs', JSON.stringify(prefs));
    } catch (e) {
        console.warn('Could not save preferences:', e);
    }
}

function loadPrefs() {
    try {
        const raw = localStorage.getItem('prodlog_prefs');
        if (!raw) return null;
        return JSON.parse(raw);
    } catch (e) {
        console.warn('Could not load preferences:', e);
        return null;
    }
}

// ============================================================
// FORM VALIDATION
// ============================================================

function clearValidation() {
    document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    document.querySelectorAll('.error-message').forEach(el => el.remove());
}

function showError(target, message) {
    if (!target) return;

    target.classList.add('error');
    const msgEl = document.createElement('div');
    msgEl.className = 'error-message';
    msgEl.innerText = message;

    if (target.parentNode) {
        if (target.nextSibling) {
            target.parentNode.insertBefore(msgEl, target.nextSibling);
        } else {
            target.parentNode.appendChild(msgEl);
        }
    }
}

function validateForm() {
    clearValidation();

    const dateEl = document.getElementById('date');
    const jobCardEl = document.getElementById('jobCardNo');
    const descEl = document.getElementById('description');
    const qtyEl = document.getElementById('qtyInput');

    let valid = true;

    if (!dateEl.value) {
        showError(dateEl, 'Date is required');
        valid = false;
    }

    if (!state.shift) {
        const shiftSection = document.querySelector('section');
        showError(shiftSection, 'Shift must be selected');
        valid = false;
    }

    if (!state.operator) {
        const op = document.getElementById('operatorGrid');
        showError(op, 'Operator must be selected');
        valid = false;
    }

    if (!state.machine) {
        const mg = document.getElementById('machineGrid');
        showError(mg, 'Machine must be selected');
        valid = false;
    }

    if (!state.operation) {
        const og = document.getElementById('operationGrid');
        showError(og, 'Operation must be selected');
        valid = false;
    }

    if (!qtyEl.value || parseInt(qtyEl.value) === 0) {
        showError(qtyEl, 'Quantity must be greater than 0');
        valid = false;
    }

    if (!jobCardEl.value) {
        showError(jobCardEl, 'Job Card No is required');
        valid = false;
    }

    if (!descEl.value) {
        showError(descEl, 'Description is required');
        valid = false;
    }

    return valid;
}

// ============================================================
// SAVE & RESET
// ============================================================

function reset() {
    state.operator = null;
    state.machine = null;
    state.operation = null;
    state.qty = 0;

    document.querySelectorAll('.scroll-grid button').forEach(btn => {
        btn.classList.remove('selected');
    });

    const fieldsToReset = ['jobCardNo', 'srNo', 'description', 'remark1', 'remark2', 'qtyInput'];
    fieldsToReset.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });

    clearValidation();
}

function save() {
    if (!validateForm()) return;

    const durationEl = document.getElementById('duration');
    const duration = durationEl ? parseInt(durationEl.innerText) : 0;

    const startTimeStr = `${String(startHour).padStart(2, '0')}:00 ${startPeriod}`;
    const endTimeStr = `${String(endHour).padStart(2, '0')}:00 ${endPeriod}`;

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
        startTime: startTimeStr,
        endTime: endTimeStr,
        duration: duration,
        remark1: document.getElementById('remark1').value || '',
        remark2: document.getElementById('remark2').value || ''
    };

    const backendUrl = window.location.hostname === 'localhost'
        ? 'http://localhost:5000/api/logs'
        : '/api/logs';

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
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                alert('Error: ' + (result.error || 'Unknown error'));
            }
        })
        .catch(err => {
            console.error('Save error:', err);
            alert(`Could not save log: ${err.message}`);
        });
}

// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    const prefs = loadPrefs();
    const dateEl = document.getElementById('date');

    if (prefs) {
        if (dateEl) dateEl.value = prefs.date || new Date().toISOString().split('T')[0];
        if (prefs.shift) {
            state.shift = prefs.shift;
            const btn = document.getElementById(`shift-${prefs.shift}`);
            if (btn) btn.classList.add('selected');
        }
        if (typeof prefs.startHour !== 'undefined') startHour = parseInt(prefs.startHour, 10);
        if (typeof prefs.endHour !== 'undefined') endHour = parseInt(prefs.endHour, 10);
        if (prefs.startPeriod) startPeriod = prefs.startPeriod;
        if (prefs.endPeriod) endPeriod = prefs.endPeriod;
    } else {
        if (dateEl) dateEl.value = new Date().toISOString().split('T')[0];
    }

    updateQty();

    const startHourEl = document.getElementById('startHour');
    const endHourEl = document.getElementById('endHour');
    if (startHourEl) startHourEl.value = startHour;
    if (endHourEl) endHourEl.value = endHour;

    const startPeriodEl = document.getElementById('startPeriod');
    const endPeriodEl = document.getElementById('endPeriod');
    if (startPeriodEl) startPeriodEl.innerText = startPeriod;
    if (endPeriodEl) endPeriodEl.innerText = endPeriod;

    calculateDuration();

    if (startHourEl) {
        startHourEl.addEventListener('input', () => updateHour('start'));
        startHourEl.addEventListener('change', () => updateHour('start'));
    }
    if (endHourEl) {
        endHourEl.addEventListener('input', () => updateHour('end'));
        endHourEl.addEventListener('change', () => updateHour('end'));
    }

    if (dateEl) {
        dateEl.addEventListener('change', savePrefs);
    }

    reloadLists();
    loadFrequencyData();
});




