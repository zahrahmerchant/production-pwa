(async () => {
    try {
        const res = await fetch('http://localhost:5000/api/logs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                date: '2026-01-28',
                shift: 'First',
                operator: 'Ramesh',
                machine: 'CNC-01',
                operation: 'Milling',
                qty: 10,
                jobCardNo: 'JC-TEST-1',
                srNo: 1,
                description: 'Test entry from script',
                startTime: '06:00 AM',
                endTime: '06:00 PM',
                duration: 12,
                remark1: 'ok',
                remark2: 'none'
            })
        });
        const data = await res.json();
        console.log('Response:', data);
    } catch (err) {
        console.error('Error posting test log:', err);
    }
})();
