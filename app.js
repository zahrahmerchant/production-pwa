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
}

function calculateDuration() {
    const start = get24Hour(startHour, startPeriod);
    const end = get24Hour(endHour, endPeriod);
    let diff = end - start;
    if (diff < 0) diff += 24;
    document.getElementById("duration").innerText = diff + " hrs";
}


function select(type, value) {
    state[type] = value;
    [...document.querySelectorAll("button")]
        .filter(b => b.innerText === value)
        .forEach(b => b.classList.add("selected"));
}

function changeQty(delta) {
    const input = document.getElementById("qtyInput");
    input.value = Math.max(0, parseInt(input.value || 0) + delta);
}


function save() {
    alert("Saved ✓ (prototype)");
    reset();
}

function reset() {
    state.operator = null;
    state.machine = null;
    state.operation = null;
    state.qty = 0;
    document.getElementById("qty").innerText = 0;
}

let startHour = 8;
let endHour = 2;
let startPeriod = "AM";
let endPeriod = "PM";

function changeHour(type, delta) {
    if (type === "start") {
        startHour = normalizeHour(startHour + delta);
        document.getElementById("startHour").innerText = startHour;
    } else {
        endHour = normalizeHour(endHour + delta);
        document.getElementById("endHour").innerText = endHour;
    }
    calculateDuration();
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
}

function normalizeHour(hour) {
    if (hour < 1) return 12;
    if (hour > 12) return 1;
    return hour;
}

function to24Hour(hour, period) {
    if (period === "AM") {
        return hour === 12 ? 0 : hour;
    } else {
        return hour === 12 ? 12 : hour + 12;
    }
}

function calculateDuration() {
    const start24 = to24Hour(startHour, startPeriod);
    const end24 = to24Hour(endHour, endPeriod);

    let duration = end24 - start24;

    // Handle cross-midnight (2nd shift)
    if (duration < 0) {
        duration += 24;
    }

    document.getElementById("duration").innerText = duration;
}
