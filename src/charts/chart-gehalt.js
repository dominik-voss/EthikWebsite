import { createBarChart } from './charts.js';

createBarChart(
    'chart-gehalt',
    ['Ja', 'Teilweise', 'Nein'],
    [42, 38, 20],
    ['#e8a020', '#f0be68', '#f5d9a8'],
    'Gehalt als Hauptentscheidungskriterium'
);