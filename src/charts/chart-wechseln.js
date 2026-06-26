import { createBarChart } from './charts.js';

export function initChartWechseln(data) {
    const total = data.length;
    const ja        = Math.round(data.filter(d => d.wuerde_wechseln === 'ja').length / total * 100);
    const vielleicht = Math.round(data.filter(d => d.wuerde_wechseln === 'vielleicht').length / total * 100);
    const nein      = Math.round(data.filter(d => d.wuerde_wechseln === 'nein').length / total * 100);

    createBarChart(
        'chart-wechseln',
        ['Ja', 'Vielleicht', 'Nein'],
        [ja, vielleicht, nein],
        ['#c0392b', '#e07070', '#f0b0b0'],
        'Würde Sektor wechseln'
    );
}