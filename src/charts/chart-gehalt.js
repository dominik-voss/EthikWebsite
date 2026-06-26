import { createBarChart } from './charts.js';

export function initChartGehalt(data) {
    const total = data.length;
    const ja        = Math.round(data.filter(d => d.gehalt_ausschlaggebend === 'ja').length / total * 100);
    const teilweise = Math.round(data.filter(d => d.gehalt_ausschlaggebend === 'teilweise').length / total * 100);
    const nein      = Math.round(data.filter(d => d.gehalt_ausschlaggebend === 'nein').length / total * 100);

    createBarChart(
        'chart-gehalt',
        ['Ja', 'Teilweise', 'Nein'],
        [ja, teilweise, nein],
        ['#e8a020', '#f0b84a', '#f5d48a'],
        'Gehalt ausschlaggebend'
    );
}