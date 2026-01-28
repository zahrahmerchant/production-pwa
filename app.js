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
