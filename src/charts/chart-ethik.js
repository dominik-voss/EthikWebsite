import { createBarChart } from './charts.js';

let allData = [];
let chartInstance = null;

export function initChartEthik(data) {
  allData = data;
  populateFilter();
  renderChart('alle');

  const select = document.getElementById('filter-studiengang-ethik');
  if (select) select.addEventListener('change', () => renderChart(select.value));
}

function populateFilter() {
  const select = document.getElementById('filter-studiengang-ethik');
  if (!select) return;

  const studiengaenge = [...new Set(
    allData.map(d => d.studiengang).filter(s => s && s.trim() !== '')
  )].sort();

  studiengaenge.forEach(sg => {
    const opt = document.createElement('option');
    opt.value = sg;
    opt.textContent = sg;
    select.appendChild(opt);
  });
}

function renderChart(filter) {
  const filtered = filter === 'alle'
    ? allData
    : allData.filter(d => d.studiengang === filter);

  const total = filtered.length;
  if (total === 0) return;

  const ja = Math.round(filtered.filter(d => d.ethik_im_studium === 'Ja').length / total * 100);
  const amRande = Math.round(filtered.filter(d => d.ethik_im_studium === 'Ja, aber nur am Rande').length / total * 100);
  const nein = Math.round(filtered.filter(d => d.ethik_im_studium === 'Nein').length / total * 100);
  const weissNicht = Math.round(filtered.filter(d => d.ethik_im_studium === 'Weiß ich nicht').length / total * 100);

  // n-Anzeige aktualisieren
  const nEl = document.getElementById('chart-ethik-n');
  if (nEl) nEl.textContent = `n = ${total}`;

  // alten Chart zerstören
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }

  chartInstance = createBarChart(
    'chart-ethik',
    ['Ja', 'Nur am Rande', 'Nein', 'Weiß nicht'],
    [ja, amRande, nein, weissNicht],
    ['#4a90e2', '#7ab3e8', '#b0cff0', '#d0e4f7'],
    'Ethik im Studium behandelt'
  );
}