import { createGroupedBarChart } from './charts.js';

export function initChartStudiengang(data) {
    const studiengaenge = ['Informatik', 'SDS', 'Maschinenbau', 'Elektrotechnik', 'IB', 'Wirtschaftsinformatik'];

    const milData = studiengaenge.map(sg => {
        const group = data.filter(d => d.studiengang && d.studiengang.trim() === sg);
        const mil   = group.filter(d => d.entscheidung === 'militaer').length;
        return group.length > 0 ? Math.round(mil / group.length * 100) : 0;
    });

    const civData = studiengaenge.map(sg => {
        const group = data.filter(d => d.studiengang && d.studiengang.trim() === sg);
        const civ   = group.filter(d => d.entscheidung === 'zivil').length;
        return group.length > 0 ? Math.round(civ / group.length * 100) : 0;
    });

    createGroupedBarChart(
        'chart-studiengang',
        studiengaenge,
        [
            { label: 'Militärsektor',  data: milData, color: '#4a90e2' },
            { label: 'Ziviler Sektor', data: civData, color: '#e8a020' },
        ]
    );
}