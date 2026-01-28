let state = {
    operator: null,
    machine: null,
    operation: null,
    qty: 0,
    shift: null
};

function setShift(s) {
    state.shift = s;
}

function select(type, value) {
    state[type] = value;
    [...document.querySelectorAll("button")]
        .filter(b => b.innerText === value)
        .forEach(b => b.classList.add("selected"));
}

function changeQty(delta) {
    state.qty = Math.max(0, state.qty + delta);
    document.getElementById("qty").innerText = state.qty;
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
