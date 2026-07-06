let allStudentsData = [];
let studentsData = [];
let studentNodes = [];
let avatarNode = null;

const TOOLTIP_OFFSET = window.innerWidth <= 768 ? 220 : 140;
let militaryTooltipOpen = false;
let civilTooltipOpen = false;
let geschlechtFilter = 'alle';
let basisFilter = 'alle';

let currentProgress = 0;

export function initStory(csv) {
  allStudentsData = parseCSV(csv);
  studentsData = allStudentsData;

  const countEl = document.getElementById('intro-total-count');
  if (countEl) countEl.textContent = allStudentsData.filter(d => d.status === 'student').length;

  createStudents(studentsData);
  updatePercentages(studentsData);
  fillAvatarFacts(studentsData);
  fillMajorityBox(studentsData);

  requestAnimationFrame(() => {
    calculateTargets();
    positionAllAtStart();
  });

  setupScrollStory();
  setupFilters();
  setupInfoButtons();
  setupScrollHint();

  window.addEventListener('resize', () => {
    calculateTargets();
    positionAllAtStart();
  });
}

/* -------------------------
   CSV
------------------------- */

function parseCSV(csv) {
  const lines = csv.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    const obj = {};
    headers.forEach((header, i) => { obj[header] = values[i]; });
    return obj;
  });
}

/* -------------------------
   Scroll-Hint
------------------------- */

function setupScrollHint() {
  const scrollHint = document.querySelector('.hero-scroll-hint');
  window.addEventListener('scroll', () => {
    if (!scrollHint) return;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const nearEnd = window.scrollY >= maxScroll - 50;
    scrollHint.style.opacity = nearEnd ? '0' : '0.8';
  }, { passive: true });
}

/* -------------------------
   Info-Buttons
------------------------- */

function setupInfoButtons() {
  const milBtn = document.getElementById('military-info-btn');
  const milTooltip = document.getElementById('military-info-tooltip');
  const civBtn = document.getElementById('civil-info-btn');
  const civTooltip = document.getElementById('civil-info-tooltip');

  if (!milBtn || !milTooltip || !civBtn || !civTooltip) return;

  milBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const opening = !milTooltip.classList.contains('visible');
    milTooltip.classList.remove('visible');
    civTooltip.classList.remove('visible');
    milBtn.classList.remove('active');
    civBtn.classList.remove('active');
    militaryTooltipOpen = false;
    civilTooltipOpen = false;
    if (opening) {
      milTooltip.classList.add('visible');
      milBtn.classList.add('active');
      militaryTooltipOpen = true;
    }
    refreshIconPositions();
  });

  civBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const opening = !civTooltip.classList.contains('visible');
    milTooltip.classList.remove('visible');
    civTooltip.classList.remove('visible');
    milBtn.classList.remove('active');
    civBtn.classList.remove('active');
    militaryTooltipOpen = false;
    civilTooltipOpen = false;
    if (opening) {
      civTooltip.classList.add('visible');
      civBtn.classList.add('active');
      civilTooltipOpen = true;
    }
    refreshIconPositions();
  });

  document.addEventListener('click', () => {
    const anyOpen = militaryTooltipOpen || civilTooltipOpen;
    milTooltip.classList.remove('visible');
    civTooltip.classList.remove('visible');
    milBtn.classList.remove('active');
    civBtn.classList.remove('active');
    militaryTooltipOpen = false;
    civilTooltipOpen = false;
    if (anyOpen) refreshIconPositions();
  });
}

/* -------------------------
   Icons nach Tooltip-Toggle neu positionieren
------------------------- */

function refreshIconPositions() {
  const { P_ICONS_END } = calcLatePhases();
  const iconsSettled = currentProgress >= P_ICONS_END;
  calculateTargets();
  if (iconsSettled) {
    studentNodes.forEach(icon => {
      icon.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
      icon.style.transform = `translate(${icon.dataset.endX}px, ${icon.dataset.endY}px)`;
    });
    setTimeout(() => {
      studentNodes.forEach(icon => { icon.style.transition = ''; });
    }, 420);
  } else {
    updateStudentPositions(currentProgress);
  }
}

/* -------------------------
   Filter
------------------------- */

function setupFilters() {
    const sgSelect = document.getElementById('studiengang-filter');
    const gsSelect = document.getElementById('geschlecht-filter');

    // Studiengänge dynamisch aus Daten befüllen
    if (sgSelect) {
        const studiengaenge = [
            ...new Set(
                allStudentsData
                    .map(d => d.studiengang)
                    .filter(s => s && s.trim() !== '')
                    .map(s => s.trim())
            )
        ].sort();

        studiengaenge.forEach(sg => {
            const opt = document.createElement('option');
            opt.value = sg;
            opt.textContent = sg;
            sgSelect.appendChild(opt);
        });
    }

    if (sgSelect) sgSelect.addEventListener('change', applyFilter);
    if (gsSelect) gsSelect.addEventListener('change', () => {
        geschlechtFilter = gsSelect.value;
        applyFilter();
    });

  document.querySelectorAll('.basis-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.basis-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      basisFilter = btn.dataset.basis;
      applyFilter();
    });
  });
}

function applyFilter() {
  const sgSelect = document.getElementById('studiengang-filter');
  const sgFilter = sgSelect ? sgSelect.value : 'alle';
  const students = allStudentsData.filter(d => d.status === 'student');

  studentNodes.forEach(icon => {
    const sgMatch = sgFilter === 'alle' || icon.dataset.studiengang === sgFilter;
    const gsMatch = geschlechtFilter === 'alle' || icon.dataset.geschlecht === geschlechtFilter;
    const match = sgMatch && gsMatch;
    icon.dataset.filtered = match ? 'show' : 'hide';
    icon.classList.toggle('filtered-out', !match);
  });

  const filtered = students.filter(d =>
    (sgFilter === 'alle' || d.studiengang === sgFilter) &&
    (geschlechtFilter === 'alle' || d.geschlecht === geschlechtFilter)
  );

  const base = basisFilter === 'entschieden'
    ? filtered.filter(d => d.entscheidung !== 'unentschieden').length
    : filtered.length;

  const milCount = filtered.filter(d => d.entscheidung === 'militaer').length;
  const civCount = filtered.filter(d => d.entscheidung === 'zivil').length;

  const milPct = base > 0 ? Math.round(milCount / base * 100) : 0;
  const civPct = base > 0 ? Math.round(civCount / base * 100) : 0;

  document.getElementById('military-percent').textContent = milPct + '% (' + milCount + ')';
  document.getElementById('civil-percent').textContent = civPct + '% (' + civCount + ')';
}

/* -------------------------
   Modus berechnen
------------------------- */

function calcModus(values) {
  const freq = {};
  values.forEach(v => { freq[v] = (freq[v] || 0) + 1; });
  return Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];
}

function findAvatarIndex(students) {
  const modusStudiengang = calcModus(
    students.filter(s => s.studiengang).map(s => s.studiengang)
  );
  const modusGeschlecht = calcModus(students.map(s => s.geschlecht));
  const modusNationalitaet = calcModus(students.map(s => s.nationalitaet));
  const modusEntscheidung = calcModus(
    students.filter(s => s.entscheidung !== 'unentschieden').map(s => s.entscheidung)
  );

  const match =
    // Alle 4 Kriterien
    students.find(s =>
      s.studiengang === modusStudiengang &&
      s.geschlecht === modusGeschlecht &&
      s.nationalitaet === modusNationalitaet &&
      s.entscheidung === modusEntscheidung
    ) ||
    // Ohne Nationalität
    students.find(s =>
      s.studiengang === modusStudiengang &&
      s.geschlecht === modusGeschlecht &&
      s.entscheidung === modusEntscheidung
    ) ||
    // Nur Studiengang + Entscheidung
    students.find(s =>
      s.studiengang === modusStudiengang &&
      s.entscheidung === modusEntscheidung
    ) ||
    // Nur Studiengang
    students.find(s => s.studiengang === modusStudiengang);

  return students.indexOf(match);
}

/* -------------------------
   Icons erzeugen
------------------------- */

function createStudents(data) {
  const overlay = document.getElementById('student-overlay');
  overlay.innerHTML = '';
  studentNodes = [];
  avatarNode = null;

  const students = data.filter(d => d.status === 'student');
  const avatarIndex = findAvatarIndex(students);

  students.forEach((student, index) => {
    const icon = document.createElement('div');
    icon.className = 'student-icon';
    icon.textContent = '👤';
    icon.dataset.target = student.entscheidung;
    icon.dataset.index = index;
    icon.dataset.studiengang = student.studiengang || '';
    icon.dataset.geschlecht = student.geschlecht || '';
    icon.dataset.filtered = 'show';

    if (index === avatarIndex) {
      icon.classList.add('student-icon--avatar');
      avatarNode = icon;

      const tooltip = document.getElementById('avatar-tooltip');
      icon.style.pointerEvents = 'auto';
      icon.addEventListener('mouseenter', () => {
        const rect = icon.getBoundingClientRect();
        const overlayRect = document.getElementById('student-overlay').getBoundingClientRect();
        tooltip.style.left = (rect.left - overlayRect.left + 30) + 'px';
        tooltip.style.top = (rect.top - overlayRect.top - 10) + 'px';
        tooltip.classList.add('visible');
      });
      icon.addEventListener('mouseleave', () => {
        tooltip.classList.remove('visible');
      });
    }
    overlay.appendChild(icon);
    studentNodes.push(icon);
  });
}

/* -------------------------
   Keyfacts befüllen
------------------------- */

function fillAvatarFacts(data) {
  const students = data.filter(d => d.status === 'student');
  const labels = {
    student: 'Student', weiblich: 'Weiblich', maennlich: 'Männlich',
    divers: 'Divers', deutsch: 'Deutsch', international: 'International',
  };
  const fmt = v => labels[v] || v;
document.getElementById('avatar-fact-alter').textContent =
    `Alter: ${calcModus(students.map(s => s.alter))}`;
  document.getElementById('avatar-fact-geschlecht').textContent =
    `Geschlecht: ${fmt(calcModus(students.map(s => s.geschlecht)))}`;
  document.getElementById('avatar-fact-nationalitaet').textContent =
    `Nationalität: ${fmt(calcModus(students.map(s => s.nationalitaet)))}`;
  document.getElementById('avatar-fact-studiengang').textContent =
    `Studiengang: ${calcModus(students.filter(s => s.studiengang).map(s => s.studiengang))}`;

  const ttMap = {
    'tt-alter': `Alter: ${calcModus(students.map(s => s.alter))}`,
    'tt-geschlecht': `Geschlecht: ${fmt(calcModus(students.map(s => s.geschlecht)))}`,
    'tt-nationalitaet': `Nationalität: ${fmt(calcModus(students.map(s => s.nationalitaet)))}`,
    'tt-studiengang': `Studiengang: ${calcModus(students.filter(s => s.studiengang).map(s => s.studiengang))}`,
  };
  Object.entries(ttMap).forEach(([id, text]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  });
}

/* -------------------------
   Mehrheitstext befüllen
------------------------- */

function fillMajorityBox(data) {
  const students = data.filter(d => d.status === 'student');
  const military = students.filter(d => d.entscheidung === 'militaer').length;
  const civil = students.filter(d => d.entscheidung === 'zivil').length;
  document.getElementById('majority-sector-label').textContent =
    military >= civil ? 'Militärsektor' : 'Zivilen Sektor';
}

/* -------------------------
   Prozentzahlen (Initial)
------------------------- */

function updatePercentages(data) {
  const students = data.filter(d => d.status === 'student');
  const total = students.length;
  const military = students.filter(d => d.entscheidung === 'militaer').length;
  const civil = students.filter(d => d.entscheidung === 'zivil').length;
  document.getElementById('military-percent').textContent =
    Math.round(military / total * 100) + '% (' + military + ')';
  document.getElementById('civil-percent').textContent =
    Math.round(civil / total * 100) + '% (' + civil + ')';
}

/* -------------------------
   Zielpositionen
------------------------- */

function calculateTargets() {
  const overlayRect = document.getElementById('student-overlay').getBoundingClientRect();
  const universityRect = document.getElementById('university-box').getBoundingClientRect();
  const militaryRect = document.getElementById('military-sector').getBoundingClientRect();
  const civilRect = document.getElementById('civil-sector').getBoundingClientRect();

  const ICON_SIZE = window.innerWidth <= 768 ? 16 : 24;
  const GAP = 4;
  const PADDING = 15;

  const milOffset = militaryTooltipOpen ? TOOLTIP_OFFSET : 0;
  const civOffset = civilTooltipOpen ? TOOLTIP_OFFSET : 0;

  const militaryCols = Math.max(1, Math.floor((militaryRect.width - PADDING * 2) / (ICON_SIZE + GAP)));
  const civilCols = Math.max(1, Math.floor((civilRect.width - PADDING * 2) / (ICON_SIZE + GAP)));
  const universityCols = Math.max(1, Math.floor((universityRect.width - 80) / (ICON_SIZE + GAP)));

  const uniTopOffset = window.innerWidth <= 768 ? 80 : 90;
  const totalRows = Math.ceil(studentNodes.length / universityCols);
  const neededHeight = uniTopOffset + totalRows * (ICON_SIZE + GAP) + 20;
  document.getElementById('university-box').style.minHeight = neededHeight + 'px';

  let militaryCount = 0;
  let civilCount = 0;

  studentNodes.forEach(icon => {
    const index = Number(icon.dataset.index);
    const startCol = index % universityCols;
    const startRow = Math.floor(index / universityCols);

    icon.dataset.startX = (universityRect.left - overlayRect.left) + 50 + startCol * (ICON_SIZE + GAP);
    icon.dataset.startY = (universityRect.top - overlayRect.top) + uniTopOffset + startRow * (ICON_SIZE + GAP);

    if (icon.dataset.target === 'militaer') {
      const col = militaryCount % militaryCols;
      const row = Math.floor(militaryCount / militaryCols);
      icon.dataset.endX = (militaryRect.left - overlayRect.left) + PADDING + col * (ICON_SIZE + GAP);
      icon.dataset.endY = (militaryRect.top - overlayRect.top) + 70 + milOffset + row * (ICON_SIZE + GAP);
      militaryCount++;
    } else if (icon.dataset.target === 'zivil') {
      const col = civilCount % civilCols;
      const row = Math.floor(civilCount / civilCols);
      icon.dataset.endX = (civilRect.left - overlayRect.left) + PADDING + col * (ICON_SIZE + GAP);
      icon.dataset.endY = (civilRect.top - overlayRect.top) + 80 + civOffset + row * (ICON_SIZE + GAP);
      civilCount++;
    } else {
  // unentschieden: endPos = startPos → bleiben stehen
  icon.dataset.endX = icon.dataset.startX;
  icon.dataset.endY = icon.dataset.startY;
}
  });

  const militaryRows = Math.ceil(militaryCount / militaryCols);
  const civilRows = Math.ceil(civilCount / civilCols);

  document.getElementById('military-sector').style.minHeight =
    `${150 + milOffset + militaryRows * (ICON_SIZE + GAP)}px`;
  document.getElementById('civil-sector').style.minHeight =
    `${150 + civOffset + civilRows * (ICON_SIZE + GAP)}px`;

  if (avatarNode) {
    const stageRect = document.getElementById('avatar-stage').getBoundingClientRect();
    avatarNode.dataset.introX = (stageRect.left - overlayRect.left) + 40;
    avatarNode.dataset.introY = (stageRect.top - overlayRect.top) + (stageRect.height / 2) - 12;
  }
}

/* -------------------------
   Icons auf Startposition setzen
------------------------- */

function positionAllAtStart() {
  studentNodes.forEach(icon => {
    if (icon === avatarNode && icon.dataset.introX) {
      icon.style.transform = `translate(${icon.dataset.introX}px, ${icon.dataset.introY}px)`;
    } else {
      icon.style.transform = `translate(${icon.dataset.startX}px, ${icon.dataset.startY}px)`;
    }
  });
}

/* -------------------------
   Scroll-Phasen
------------------------- */

const P_INTRO = 0;
const P_AVATAR = 0.15;
const P_UNIVERSITY = 0.22;
const P_AVATAR_MOVE = 0.25;
const P_AVATAR_ARRIVE = 0.33;
const P_SECTORS = 0.42;
const P_PAN_START = 0.40;
const P_PAN_END = 0.65;
const P_ICONS_START = 0.56;
const P_MAJORITY_IN = 0.50;

function calcLatePhases() {
  const isMobile = window.innerWidth <= 768;
  const factor = isMobile ? 0.7 : Math.min(1, window.innerHeight / 900);
  const P_ICONS_END = 0.58 + 0.28 * factor;
  const P_PERCENT = P_ICONS_END + 0.02;
  const P_MAJORITY_OUT = P_ICONS_END;
  return { P_ICONS_END, P_PERCENT, P_MAJORITY_OUT };
}

/* -------------------------
   Pan
------------------------- */

function updatePan(progress) {
  const sticky = document.querySelector('.story-sticky');
  if (progress <= P_PAN_START) {
    sticky.style.transform = '';
  } else {
    const universityRect = document.getElementById('university-box').getBoundingClientRect();
    const sectorsRect = document.getElementById('sector-row').getBoundingClientRect();
    const totalHeight = sectorsRect.bottom - universityRect.top;
    const viewportH = window.innerHeight;
    const maxShift = Math.max(0, totalHeight - viewportH + 120);
    if (progress >= P_PAN_END) {
      sticky.style.transform = `translateY(-${maxShift}px)`;
    } else {
      const t = (progress - P_PAN_START) / (P_PAN_END - P_PAN_START);
      sticky.style.transform = `translateY(-${maxShift * t}px)`;
    }
  }
}

/* -------------------------
   Icon-Positionen animieren
------------------------- */

function updateStudentPositions(progress) {
  const { P_ICONS_END } = calcLatePhases();

  studentNodes.forEach(icon => {
    const startX = Number(icon.dataset.startX);
    const startY = Number(icon.dataset.startY);
    const endX = Number(icon.dataset.endX);
    const endY = Number(icon.dataset.endY);

    if (icon === avatarNode) {
      const introX = Number(icon.dataset.introX || startX);
      const introY = Number(icon.dataset.introY || startY);
      let x, y;
      if (progress < P_AVATAR_MOVE) {
        x = introX; y = introY;
      } else if (progress < P_AVATAR_ARRIVE) {
        const t = (progress - P_AVATAR_MOVE) / (P_AVATAR_ARRIVE - P_AVATAR_MOVE);
        x = introX + (startX - introX) * t;
        y = introY + (startY - introY) * t;
      } else if (progress < P_ICONS_START) {
        x = startX; y = startY;
      } else {
        const t = Math.min((progress - P_ICONS_START) / (P_ICONS_END - P_ICONS_START), 1);
        x = startX + (endX - startX) * t;
        y = startY + (endY - startY) * t;
      }
      icon.style.transform = `translate(${x}px, ${y}px)`;
    } else {
  const t = Math.min(Math.max((progress - P_ICONS_START) / (P_ICONS_END - P_ICONS_START), 0), 1);
  icon.style.transform = `translate(${startX + (endX - startX) * t}px, ${startY + (endY - startY) * t}px)`;

  // Grau erst wenn Animation startet
  if (icon.dataset.target === 'unentschieden') {
    icon.style.background = t > 0 ? '#888888' : '';
  }
}
  });
}

/* -------------------------
   Story-Steuerung
------------------------- */

function setupScrollStory() {
  const scene = document.getElementById('career-scene');
  const intro = document.getElementById('intro-box');
  const avatarStage = document.getElementById('avatar-stage');
  const university = document.getElementById('university-box');
  const sectors = document.getElementById('sector-row');
  const majorityBox = document.getElementById('majority-box');

  // Vorlauf wird subtrahiert, damit die Scene früher startet
  window.addEventListener('scroll', () => {
    const sceneRect = scene.getBoundingClientRect();
    const earlyStart = window.innerHeight * 0.8; // Scene startet 80vh früher

    currentProgress = Math.min(
        Math.max(
            (-sceneRect.top + earlyStart) /
            (scene.offsetHeight - window.innerHeight + earlyStart),
            0
        ),
        1
    );
   
    const { P_ICONS_END, P_PERCENT, P_MAJORITY_OUT } = calcLatePhases();

    intro.classList.toggle('phase-visible', currentProgress > P_INTRO);
    avatarStage.classList.toggle('phase-visible', currentProgress > P_AVATAR);

    studentNodes.forEach(icon => {
      icon.classList.toggle('visible',
        icon === avatarNode
          ? currentProgress > P_AVATAR
          : currentProgress > P_UNIVERSITY
      );
    });

    //avatarStage.classList.toggle('phase-hidden-out', currentProgress > P_UNIVERSITY);
    university.classList.toggle('phase-visible', currentProgress > P_UNIVERSITY);
    sectors.classList.toggle('phase-visible', currentProgress > P_SECTORS);

    const majorityVisible = currentProgress > P_MAJORITY_IN && currentProgress < P_MAJORITY_OUT;
    majorityBox.classList.toggle('phase-visible', majorityVisible);

    updatePan(currentProgress);
    calculateTargets();
    updateStudentPositions(currentProgress);

    document.getElementById('military-percent')
      .classList.toggle('visible', currentProgress > P_PERCENT);
    document.getElementById('civil-percent')
      .classList.toggle('visible', currentProgress > P_PERCENT);
    document.getElementById('filter-bar')
      .classList.toggle('phase-visible', currentProgress > P_ICONS_END);
  });
}