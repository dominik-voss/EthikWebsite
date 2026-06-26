import { createBarChart } from './charts.js';

export function initChartEthik(data) {
    const total = data.length;
    const ja        = Math.round(data.filter(d => d.ethik_wichtig === 'ja').length / total * 100);
    const teilweise = Math.round(data.filter(d => d.ethik_wichtig === 'teilweise').length / total * 100);
    const nein      = Math.round(data.filter(d => d.ethik_wichtig === 'nein').length / total * 100);

    createBarChart(
        'chart-ethik',
        ['Ja', 'Teilweise', 'Nein'],
        [ja, teilweise, nein],
        ['#4a90e2', '#7ab3e8', '#b0cff0'],
        'Ethik wichtig bei Arbeitgeberwahl'
    );
}