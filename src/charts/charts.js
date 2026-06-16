export function initCharts() {

    import('./chart-ethik.js');
    import('./chart-gehalt.js');
    import('./chart-wechseln.js');
    import('./chart-studiengang.js');
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