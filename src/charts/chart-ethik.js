import { createBarChart } from './charts.js';

export function initChartEthik(data) {
    const total = data.length;
    const ja        = Math.round(data.filter(d => d.ethik_im_studium === 'Ja').length / total * 100);
    const amRande   = Math.round(data.filter(d => d.ethik_im_studium === 'Ja, aber nur am Rande').length / total * 100);
    const nein      = Math.round(data.filter(d => d.ethik_im_studium === 'Nein').length / total * 100);
    const weissNicht = Math.round(data.filter(d => d.ethik_im_studium === 'Weiß ich nicht').length / total * 100);

    createBarChart(
        'chart-ethik',
        ['Ja', 'Nur am Rande', 'Nein', 'Weiß nicht'],
        [ja, amRande, nein, weissNicht],
        ['#4a90e2', '#7ab3e8', '#b0cff0', '#d0e4f7'],
        'Ethik im Studium behandelt'
    );
}