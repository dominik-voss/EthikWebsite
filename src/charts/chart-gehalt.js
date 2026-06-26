import { createBarChart } from './charts.js';
import { createGroupedBarChart } from './charts.js';

export function initChartGehalt(data) {
    const studiengaenge = ['Informatik', 'SDS', 'Maschinenbau', 'Elektrotechnik', 'IB', 'Wirtschaftsinformatik'];

    const avgDefense = studiengaenge.map(sg => {
        const group = data.filter(d => d.studiengang && d.studiengang.trim() === sg);
        if (group.length === 0) return 0;
        const sum = group.reduce((acc, d) => acc + Number(d.vorstellen_defense || 0), 0);
        return Math.round((sum / group.length) * 10) / 10;
    });

    const ctx = document.getElementById('chart-gehalt');
    if (!ctx) return;

    new window.Chart(ctx, {
        type: 'bar',
        data: {
            labels: studiengaenge,
            datasets: [{
                label: 'Ø Vorstellbarkeit (1-5)',
                data: avgDefense,
                backgroundColor: '#e8a020',
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
                    callbacks: { label: ctx => ` Ø ${ctx.parsed.y}` }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 5,
                    ticks: {
                        callback: v => v,
                        color: getComputedStyle(document.documentElement)
                            .getPropertyValue('--chart-tick-color').trim() || '#555',
                    },
                    grid: {
                        color: getComputedStyle(document.documentElement)
                            .getPropertyValue('--chart-grid-color').trim()
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