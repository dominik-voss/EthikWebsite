import { createBarChart } from './charts.js';

export function initChartWechseln(data) {
    const total = data.length;
    const scores = [1, 2, 3, 4, 5].map(score =>
        Math.round(data.filter(d => Number(d.gewissenskonflikte) === score).length / total * 100)
    );

    createBarChart(
        'chart-wechseln',
        ['1 (keine)', '2', '3', '4', '5 (starke)'],
        scores,
        ['#c0392b', '#d05050', '#e07070', '#f09090', '#f0b0b0'],
        'Gewissenskonflikte'
    );
}