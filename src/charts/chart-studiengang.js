import { createGroupedBarChart } from './charts.js';

createGroupedBarChart(
    'chart-studiengang',
    ['Informatik', 'BWL', 'Maschinenbau'],
    [
        { label: 'Militärsektor', data: [36, 51, 43], color: '#4a90e2' },
        { label: 'Ziviler Sektor', data: [64, 49, 57], color: '#e8a020' },
    ]
);