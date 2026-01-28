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
    input.value = Math.max(0, parseInt(input.value || 0) + delta);
}


function save() {
    if (!validateForm()) return;

    alert("Saved ✓ (prototype)");
    reset();
}

function reset() {
    // Clear state
    state.operator = null;
    state.machine = null;
    state.operation = null;
    state.qty = 0;
    state.shift = null;

    // Clear UI
    document.getElementById("date").value = "";
    document.getElementById("qtyInput").value = "0";

    // Reset all buttons
    document.querySelectorAll("button").forEach(btn => {
        btn.classList.remove("selected");
    });

    // Reset time to defaults
    startHour = 6;
    endHour = 6;
    startPeriod = "AM";
    endPeriod = "PM";
    document.getElementById("startHour").innerText = "6";
    document.getElementById("endHour").innerText = "6";
    document.getElementById("startPeriod").innerText = "AM";
    document.getElementById("endPeriod").innerText = "PM";
    calculateDuration();

    // Clear all text inputs
    document.querySelectorAll("input[type='text'], input[type='number']").forEach(input => {
        if (input.id !== "date" && input.id !== "qtyInput") {
            input.value = "";
        }
    });
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
    const date = document.getElementById("date").value;
    const jobCardNo = document.getElementById("jobCardNo").value;
    const description = document.getElementById("description").value;

    const errors = [];

    if (!date) errors.push("Date is required");
    if (!state.shift) errors.push("Shift must be selected");
    if (!state.operator) errors.push("Operator must be selected");
    if (!state.machine) errors.push("Machine must be selected");
    if (!state.operation) errors.push("Operation must be selected");
    if (!document.getElementById("qtyInput").value || parseInt(document.getElementById("qtyInput").value) === 0) {
        errors.push("Quantity must be greater than 0");
    }
    if (!jobCardNo) errors.push("Job Card No is required");
    if (!description) errors.push("Description is required");

    if (errors.length > 0) {
        alert("Please fix these errors:\n\n" + errors.join("\n"));
        return false;
    }

    return true;
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


