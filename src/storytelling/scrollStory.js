let studentsData = [];
let studentNodes = [];

export function initStory(csv) {

    studentsData = parseCSV(csv);

    createStudents(studentsData);

    updatePercentages(studentsData);

    requestAnimationFrame(() => {
        calculateTargets();
        positionAllAtStart();   // Icons sofort auf Startposition setzen
    });

    setupScrollStory();

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

        headers.forEach((header, index) => {
            obj[header] = values[index];
        });

        return obj;
    });
}


/* -------------------------
   Icons erzeugen
------------------------- */

function createStudents(data) {

    const overlay = document.getElementById('student-overlay');

    overlay.innerHTML = '';

    studentNodes = [];

    const students = data.filter(d => d.status === 'student');

    students.forEach((student, index) => {

        const icon = document.createElement('div');

        icon.className = 'student-icon';

        icon.textContent = '👤';

        icon.dataset.target = student.entscheidung;

        icon.dataset.index = index;

        overlay.appendChild(icon);

        studentNodes.push(icon);
    });
}


/* -------------------------
   Prozentzahlen
------------------------- */

function updatePercentages(data) {

    const students = data.filter(d => d.status === 'student');

    const total = students.length;

    const military = students.filter(d => d.entscheidung === 'militaer').length;

    const civil = students.filter(d => d.entscheidung === 'zivil').length;

    document.getElementById('military-percent').textContent =
        Math.round(military / total * 100) + '%';

    document.getElementById('civil-percent').textContent =
        Math.round(civil / total * 100) + '%';
}


/* -------------------------
   Zielpositionen
------------------------- */

function calculateTargets() {

    const universityRect =
        document.getElementById('university-box').getBoundingClientRect();

    const military =
        document.getElementById('military-sector').getBoundingClientRect();

    const civil =
        document.getElementById('civil-sector').getBoundingClientRect();

    const ICON_SIZE = 24;
    const GAP = 4;
    const PADDING = 15;

    const militaryCols = Math.max(
        1,
        Math.floor((military.width - PADDING * 2) / (ICON_SIZE + GAP))
    );

    const civilCols = Math.max(
        1,
        Math.floor((civil.width - PADDING * 2) / (ICON_SIZE + GAP))
    );

    const universityCols = Math.max(
        1,
        Math.floor((universityRect.width - 80) / (ICON_SIZE + GAP))
    );

    let militaryCount = 0;
    let civilCount = 0;

    studentNodes.forEach(icon => {

        const index = Number(icon.dataset.index);

        const startCol = index % universityCols;
        const startRow = Math.floor(index / universityCols);

        // Scrolloffset einberechnen, damit die Koordinaten dokumentrelativ sind
        icon.dataset.startX =
            universityRect.left + window.scrollX + 50 + startCol * (ICON_SIZE + GAP);

        icon.dataset.startY =
            universityRect.top + window.scrollY + 90 + startRow * (ICON_SIZE + GAP);

        if (icon.dataset.target === 'militaer') {

            const col = militaryCount % militaryCols;
            const row = Math.floor(militaryCount / militaryCols);

            icon.dataset.endX =
                military.left + window.scrollX + PADDING + col * (ICON_SIZE + GAP);

            icon.dataset.endY =
                military.top + window.scrollY + 70 + row * (ICON_SIZE + GAP);

            militaryCount++;

        } else {

            const col = civilCount % civilCols;
            const row = Math.floor(civilCount / civilCols);

            icon.dataset.endX =
                civil.left + window.scrollX + PADDING + col * (ICON_SIZE + GAP);

            icon.dataset.endY =
                civil.top + window.scrollY + 80 + row * (ICON_SIZE + GAP);

            civilCount++;
        }
    });

    const militaryRows = Math.ceil(militaryCount / militaryCols);
    const civilRows    = Math.ceil(civilCount    / civilCols);

    document.getElementById('military-sector').style.minHeight =
        `${150 + militaryRows * (ICON_SIZE + GAP)}px`;

    document.getElementById('civil-sector').style.minHeight =
        `${150 + civilRows * (ICON_SIZE + GAP)}px`;
}


/* -------------------------
   Icons auf Startposition setzen
------------------------- */

function positionAllAtStart() {

    studentNodes.forEach(icon => {

        const x = Number(icon.dataset.startX);
        const y = Number(icon.dataset.startY);

        icon.style.transform = `translate(${x}px, ${y}px)`;
    });
}


/* -------------------------
   Scrollanimation
------------------------- */

// ANIMATION_START: Icons beginnen sich zu bewegen (nach Sektoren-Einblendung)
// ANIMATION_END:   Bewegung abgeschlossen
const ANIMATION_START = 0.55;
const ANIMATION_END   = 0.90;

function updateStudentPositions(progress) {

    const span = ANIMATION_END - ANIMATION_START;

    const localProgress = Math.min(
        Math.max((progress - ANIMATION_START) / span, 0),
        1
    );

    studentNodes.forEach(icon => {

        const startX = Number(icon.dataset.startX);
        const startY = Number(icon.dataset.startY);
        const endX   = Number(icon.dataset.endX);
        const endY   = Number(icon.dataset.endY);

        const x = startX + (endX - startX) * localProgress;
        const y = startY + (endY - startY) * localProgress;

        icon.style.transform = `translate(${x}px, ${y}px)`;
    });
}


/* -------------------------
   Story-Steuerung
------------------------- */

function setupScrollStory() {

    const scene      = document.getElementById('career-scene');
    const intro      = document.getElementById('intro-box');
    const university = document.getElementById('university-box');
    const sectors    = document.getElementById('sector-row');

    window.addEventListener('scroll', () => {

        const progress = Math.min(
            Math.max(
                -scene.getBoundingClientRect().top /
                (scene.offsetHeight - window.innerHeight),
                0
            ),
            1
        );

        intro.classList.toggle('phase-visible', progress > 0.05);

        university.classList.toggle('phase-visible', progress > 0.25);

        studentNodes.forEach(icon => {
            icon.classList.toggle('visible', progress > 0.25);
        });

        sectors.classList.toggle('phase-visible', progress > 0.50);

        updateStudentPositions(progress);

        document.getElementById('military-percent')
            .classList.toggle('visible', progress > 0.92);

        document.getElementById('civil-percent')
            .classList.toggle('visible', progress > 0.92);
    });
}