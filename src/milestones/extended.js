export async function initExtendedMilestones(data) {
    initRanking(data);
    initScenario(data);
    initReasons(data);

    const quotesRes = await fetch(import.meta.env.BASE_URL + 'data/quotes.json');
    const quotes = await quotesRes.json();
    initQuoteCarousel(quotes);
}

function initRanking(data) {
    const container = document.getElementById('ranking-list');
    if (!container) return;

    const categories = [
        { key: 'rank_interesse_spass', label: 'Interesse & Spaß an der Tätigkeit' },
        { key: 'rank_gehalt', label: 'Gehalt' },
        { key: 'rank_jobsicherheit', label: 'Jobsicherheit' },
        { key: 'rank_karriere', label: 'Karriere & Aufstiegsmöglichkeiten' },
        { key: 'rank_work_life_balance', label: 'Work-Life-Balance' },
        { key: 'rank_arbeitsklima', label: 'Gutes Arbeitsklima' },
        { key: 'rank_moralische_werte', label: 'Übereinstimmung mit moralischen Werten' },
        { key: 'rank_gesellschaftlicher_beitrag', label: 'Gesellschaftlicher Beitrag' },
    ];

    const withAvg = categories.map(cat => {
        const vals = data.map(d => Number(d[cat.key])).filter(v => !isNaN(v));
        const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
        return { ...cat, avg };
    });

    withAvg.sort((a, b) => a.avg - b.avg);

    container.innerHTML = withAvg.map((cat, i) => {
    const importance = 8 - cat.avg;
    const pct = Math.round((importance / 7) * 100);
    const isLow = i >= withAvg.length - 2;
    return `
        <div class="ranking-row">
            <span class="ranking-number">${i + 1}.</span>
            <span class="ranking-label">${cat.label}</span>
            <div class="ranking-track">
                <div class="ranking-fill ${isLow ? 'low' : ''}" data-width="${pct}" style="width: 0%"></div>
            </div>
            <span class="ranking-pct">${pct}%</span>
        </div>
    `;
}).join('');

animateRankingBars();
}

function animateRankingBars() {
    const bars = document.querySelectorAll('.ranking-fill');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bar = entry.target;
                bar.style.width = bar.dataset.width + '%';
                observer.unobserve(bar);
            }
        });
    }, { threshold: 0.3 });

    bars.forEach(bar => observer.observe(bar));
}

function initScenario(data) {
    const generalBar = document.getElementById('bar-general');
    const scenarioBar = document.getElementById('bar-scenario');
    if (!generalBar || !scenarioBar) return;

    const total = data.length;

    const buildBar = (key) => {
        const mil = data.filter(d => d[key] === 'militaer').length;
        const unt = data.filter(d => d[key] === 'unentschieden').length;
        const ziv = data.filter(d => d[key] === 'zivil').length;

        const milPct = Math.round(mil / total * 100);
        const untPct = Math.round(unt / total * 100);
        const zivPct = Math.round(ziv / total * 100);

        return `
            <div class="comparison-segment" style="width: ${milPct}%; background: #181f30; color: #fff;">${milPct}%</div>
            <div class="comparison-segment" style="width: ${untPct}%; background: #b4b2a9; color: #2c2c2a;">${untPct}%</div>
            <div class="comparison-segment" style="width: ${zivPct}%; background: #e8a020; color: #412402;">${zivPct}%</div>
        `;
    };

    generalBar.innerHTML = buildBar('entscheidung');
    scenarioBar.innerHTML = buildBar('f17_bucket');
}

function initReasons(data) {
    const proContainer = document.getElementById('reasons-pro');
    const contraContainer = document.getElementById('reasons-contra');
    if (!proContainer || !contraContainer) return;

    const proCategories = [
        { key: 'pro_innovation', label: 'Innovation & interessante Projekte' },
        { key: 'pro_finanzielle_gruende', label: 'Finanzielle Gründe' },
        { key: 'pro_werte_schutz', label: 'Schutz demokratischer Werte' },
        { key: 'pro_karrierechancen', label: 'Berufliche Perspektiven' },
        { key: 'pro_geopolitik', label: 'Geopolitische Verantwortung' },
    ];

    const contraCategories = [
        { key: 'contra_moralische_bedenken', label: 'Moralische / ethische Bedenken' },
        { key: 'contra_politische_ueberzeugung', label: 'Politische Überzeugung' },
        { key: 'contra_sicherheitsbedenken', label: 'Sicherheitsbedenken' },
        { key: 'contra_rechtliche_unklarheit', label: 'Unklare rechtliche Verantwortung' },
        { key: 'contra_soziales_umfeld', label: 'Soziales Umfeld / Stigmatisierung' },
    ];

    const countAndSort = (cats) => cats
        .map(cat => ({ ...cat, count: data.filter(d => d[cat.key] === '1').length }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

    const renderList = (list) => list.map(cat => `
        <div class="reasons-row">
            <span>${cat.label}</span>
            <span class="reasons-count">${cat.count}</span>
        </div>
    `).join('');

    proContainer.innerHTML = renderList(countAndSort(proCategories));
    contraContainer.innerHTML = renderList(countAndSort(contraCategories));
}

function initQuoteCarousel(quotes) {
    const textEl = document.getElementById('quote-text');
    const metaEl = document.getElementById('quote-meta');
    const dotsEl = document.getElementById('quote-dots');
    const nextBtn = document.getElementById('quote-next-btn');
    if (!textEl || !nextBtn) return;

    let current = 0;

    function render() {
        textEl.textContent = `„${quotes[current]}"`;
        metaEl.textContent = `Zitat ${current + 1} von ${quotes.length} · Freitext-Antworten`;
        dotsEl.innerHTML = quotes.map((_, i) =>
            `<span class="quote-dot ${i === current ? 'active' : ''}"></span>`
        ).join('');
    }

    nextBtn.addEventListener('click', () => {
        current = (current + 1) % quotes.length;
        render();
    });

    render();
}