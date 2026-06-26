export function initCharts(csv) {
    const data = parseCSV(csv).filter(d => d.status === 'student');
    
    import('./chart-ethik.js').then(m => m.initChartEthik(data));
    import('./chart-gehalt.js').then(m => m.initChartGehalt(data));
    import('./chart-wechseln.js').then(m => m.initChartWechseln(data));
    import('./chart-studiengang.js').then(m => m.initChartStudiengang(data));
}

function parseCSV(csv) {
    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    return lines.slice(1).map(line => {
        const values = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            if (line[i] === '"') {
                inQuotes = !inQuotes;
            } else if (line[i] === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
            } else {
                current += line[i];
            }
        }
        values.push(current.trim());
        const obj = {};
        headers.forEach((h, i) => { obj[h] = values[i]; });
        return obj;
    });
}

/* -------------------------
   Hilfsfunktion: einfacher Bar Chart
------------------------- */

export function createBarChart(canvasId, labels, data, colors, title) {

    const ctx = document.getElementById(canvasId);

    if (!ctx) return;

    new window.Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: title,
                data,
                backgroundColor: colors,
                borderRadius: 8,
                borderSkipped: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: ctx => ` ${ctx.parsed.y} %`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: v => v + ' %',
                        color: getComputedStyle(document.documentElement)
                            .getPropertyValue('--chart-tick-color').trim() || '#555',
                    },
                    grid: {
                        color: getComputedStyle(document.documentElement)
                            .getPropertyValue('--chart-grid-color').trim() || 'rgba(0,0,0,0.08)',
                    }
                },
                x: {
                    ticks: {
                        color: getComputedStyle(document.documentElement)
                            .getPropertyValue('--chart-tick-color').trim() || '#555',
                    },
                    grid: { display: false }
                }
            }
        }
    });
}


/* -------------------------
   Hilfsfunktion: gruppierter Bar Chart
------------------------- */

export function createGroupedBarChart(canvasId, labels, datasets) {

    const ctx = document.getElementById(canvasId);

    if (!ctx) return;

    const tickColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--chart-tick-color').trim() || '#555';

    const gridColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--chart-grid-color').trim() || 'rgba(0,0,0,0.08)';

    new window.Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: datasets.map(ds => ({
                label:           ds.label,
                data:            ds.data,
                backgroundColor: ds.color,
                borderRadius:    6,
                borderSkipped:   false,
            }))
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color:     tickColor,
                        boxRadius: 4,
                    }
                },
                tooltip: {
                    callbacks: {
                        label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y} %`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: v => v + ' %',
                        color: tickColor,
                    },
                    grid: { color: gridColor }
                },
                x: {
                    ticks: { color: tickColor },
                    grid:  { display: false }
                }
            }
        }
    });
}