export function initMilestones(csv) {
    const data = parseCSV(csv).filter(d => d.status === 'student');

    const mil = data.filter(d => d.entscheidung === 'militaer');
    const ziv = data.filter(d => d.entscheidung === 'zivil');

    const avg = (arr, key) => {
        const vals = arr.map(d => Number(d[key])).filter(v => !isNaN(v));
        return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
    };

    // Milestone 2: Zwei Welten
    setText('m2-mil-vorstellen', avg(mil, 'vorstellen_defense').toFixed(1));
    setText('m2-ziv-vorstellen', avg(ziv, 'vorstellen_defense').toFixed(1));
    setText('m2-mil-gewissen',   avg(mil, 'gewissenskonflikte').toFixed(1));
    setText('m2-ziv-gewissen',   avg(ziv, 'gewissenskonflikte').toFixed(1));

    // Milestone 3: Dual-Use
    setText('m3-mil-dualuse', avg(mil, 'dualuse_bedenken').toFixed(1));
    setText('m3-ziv-dualuse', avg(ziv, 'dualuse_bedenken').toFixed(1));

    // Milestone 4: Zeitenwende
    const zeitenwendeAvg = avg(data, 'einstellung_veraendert');
    setText('m4-avg', zeitenwendeAvg.toFixed(1));

    const total = data.length;
    const dist = [1, 2, 3, 4, 5].map(score =>
        data.filter(d => Number(d.einstellung_veraendert) === score).length
    );
    const distPct = dist.map(count => Math.round(count / total * 100));

    distPct.forEach((pct, i) => {
        const bar = document.getElementById(`m4-bar-${i + 1}`);
        if (bar) {
            bar.style.height = pct + '%';
            bar.dataset.pct = pct + '%';
        }
        setText(`m4-pct-${i + 1}`, pct + '%');
    });

    // Milestone 5: Ethik Vorbereitung (waffle)
    const ethikJa = data.filter(d => d.ethik_im_studium === 'Ja').length;
    const ethikJaPct = Math.round(ethikJa / total * 100);
    const ethikNeinPct = 100 - ethikJaPct;

    setText('m5-ja-pct', ethikJaPct + '%');
    setText('m5-ja-count', `${ethikJa} Personen`);
    setText('m5-nein-pct', ethikNeinPct + '%');
    setText('m5-nein-count', `${total - ethikJa} Personen`);
    setText('m5-total', `${total} Studierende`);

    initWaffle(ethikJaPct);
}

function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function initWaffle(jaPct) {
    const grid = document.getElementById('waffle-chart');
    if (!grid) return;
    grid.innerHTML = '';
    const jaCells = Math.round(jaPct);
    for (let i = 0; i < 100; i++) {
        const cell = document.createElement('div');
        cell.style.cssText = `width: 18px; height: 18px; border-radius: 3px; background: ${i < jaCells ? 'var(--color-primary)' : 'var(--color-border)'};`;
        grid.appendChild(cell);
    }
}

function parseCSV(csv) {
    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    return lines.slice(1).map(line => {
        const values = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            if (line[i] === '"') {
                inQuotes = !inQuotes;
            } else if (line[i] === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
            } else {
                current += line[i];
            }
        }
        values.push(current.trim());
        const obj = {};
        headers.forEach((h, i) => { obj[h] = values[i]; });
        return obj;
    });
}