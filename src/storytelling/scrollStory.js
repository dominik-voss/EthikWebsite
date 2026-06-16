let studentsData = [];
let studentNodes  = [];
let avatarNode    = null;   // Das gelbe Icon (separater Verweis)

export function initStory(csv) {

    studentsData = parseCSV(csv);

    createStudents(studentsData);

    updatePercentages(studentsData);

    fillAvatarFacts(studentsData);

    requestAnimationFrame(() => {
        calculateTargets();
        positionAllAtStart();
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
   Modus berechnen
------------------------- */

function calcModus(values) {

    const freq = {};

    values.forEach(v => {
        freq[v] = (freq[v] || 0) + 1;
    });

    return Object.entries(freq)
        .sort((a, b) => b[1] - a[1])[0][0];
}

function findAvatarIndex(students) {

    const modusGeschlecht    = calcModus(students.map(s => s.geschlecht));
    const modusNationalitaet = calcModus(students.map(s => s.nationalitaet));
    const modusEntscheidung  = calcModus(students.map(s => s.entscheidung));

    const match =
        students.find(s =>
            s.geschlecht    === modusGeschlecht &&
            s.nationalitaet === modusNationalitaet &&
            s.entscheidung  === modusEntscheidung
        ) ||
        students.find(s =>
            s.geschlecht   === modusGeschlecht &&
            s.entscheidung === modusEntscheidung
        ) ||
        students.find(s =>
            s.entscheidung === modusEntscheidung
        );

    return students.indexOf(match);
}


/* -------------------------
   Icons erzeugen
------------------------- */

function createStudents(data) {

    const overlay = document.getElementById('student-overlay');

    overlay.innerHTML = '';

    studentNodes = [];
    avatarNode   = null;

    const students = data.filter(d => d.status === 'student');

    const avatarIndex = findAvatarIndex(students);

    students.forEach((student, index) => {

        const icon = document.createElement('div');

        icon.className      = 'student-icon';
        icon.textContent    = '👤';
        icon.dataset.target = student.entscheidung;
        icon.dataset.index  = index;

        if (index === avatarIndex) {
            icon.classList.add('student-icon--avatar');
            avatarNode = icon;
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

    const modusStatus        = calcModus(students.map(s => s.status));
    const modusGeschlecht    = calcModus(students.map(s => s.geschlecht));
    const modusNationalitaet = calcModus(students.map(s => s.nationalitaet));

    const labels = {
        student:       'Student',
        weiblich:      'Weiblich',
        maennlich:     'Männlich',
        divers:        'Divers',
        deutsch:       'Deutsch',
        international: 'International',
    };

    const fmt = v => labels[v] || v;

    document.getElementById('avatar-fact-status').textContent =
        `Status: ${fmt(modusStatus)}`;

    document.getElementById('avatar-fact-geschlecht').textContent =
        `Geschlecht: ${fmt(modusGeschlecht)}`;

    document.getElementById('avatar-fact-nationalitaet').textContent =
        `Nationalität: ${fmt(modusNationalitaet)}`;
}


/* -------------------------
   Prozentzahlen
------------------------- */

function updatePercentages(data) {

    const students = data.filter(d => d.status === 'student');

    const total    = students.length;
    const military = students.filter(d => d.entscheidung === 'militaer').length;
    const civil    = students.filter(d => d.entscheidung === 'zivil').length;

    document.getElementById('military-percent').textContent =
        Math.round(military / total * 100) + '%';

    document.getElementById('civil-percent').textContent =
        Math.round(civil / total * 100) + '%';
}


/* -------------------------
   Zielpositionen
------------------------- */

function calculateTargets() {

    const overlayRect =
        document.getElementById('student-overlay').getBoundingClientRect();

    const universityRect =
        document.getElementById('university-box').getBoundingClientRect();

    const militaryRect =
        document.getElementById('military-sector').getBoundingClientRect();

    const civilRect =
        document.getElementById('civil-sector').getBoundingClientRect();

    const ICON_SIZE = 24;
    const GAP       = 4;
    const PADDING   = 15;

    const militaryCols = Math.max(
        1,
        Math.floor((militaryRect.width - PADDING * 2) / (ICON_SIZE + GAP))
    );

    const civilCols = Math.max(
        1,
        Math.floor((civilRect.width - PADDING * 2) / (ICON_SIZE + GAP))
    );

    const universityCols = Math.max(
        1,
        Math.floor((universityRect.width - 80) / (ICON_SIZE + GAP))
    );

    let militaryCount = 0;
    let civilCount    = 0;

    studentNodes.forEach(icon => {

        const index    = Number(icon.dataset.index);
        const startCol = index % universityCols;
        const startRow = Math.floor(index / universityCols);

        icon.dataset.startX =
            (universityRect.left - overlayRect.left) + 50 + startCol * (ICON_SIZE + GAP);

        icon.dataset.startY =
            (universityRect.top - overlayRect.top) + 90 + startRow * (ICON_SIZE + GAP);

        if (icon.dataset.target === 'militaer') {

            const col = militaryCount % militaryCols;
            const row = Math.floor(militaryCount / militaryCols);

            icon.dataset.endX =
                (militaryRect.left - overlayRect.left) + PADDING + col * (ICON_SIZE + GAP);

            icon.dataset.endY =
                (militaryRect.top - overlayRect.top) + 70 + row * (ICON_SIZE + GAP);

            militaryCount++;

        } else {

            const col = civilCount % civilCols;
            const row = Math.floor(civilCount / civilCols);

            icon.dataset.endX =
                (civilRect.left - overlayRect.left) + PADDING + col * (ICON_SIZE + GAP);

            icon.dataset.endY =
                (civilRect.top - overlayRect.top) + 80 + row * (ICON_SIZE + GAP);

            civilCount++;
        }
    });

    // Mindesthoehen der Sektorkarten setzen
    const militaryRows = Math.ceil(militaryCount / militaryCols);
    const civilRows    = Math.ceil(civilCount    / civilCols);

    document.getElementById('military-sector').style.minHeight =
        `${150 + militaryRows * (ICON_SIZE + GAP)}px`;

    document.getElementById('civil-sector').style.minHeight =
        `${150 + civilRows * (ICON_SIZE + GAP)}px`;

    // Startposition des Avatars: zentriert auf die Avatar-Stage
    if (avatarNode) {

        const stageRect =
            document.getElementById('avatar-stage').getBoundingClientRect();

        // Mitte der Stage, leicht links von der Mitte (wo das Icon-Kreis-Element ist)
        avatarNode.dataset.introX =
            (stageRect.left - overlayRect.left) + 40;

        avatarNode.dataset.introY =
            (stageRect.top - overlayRect.top) + (stageRect.height / 2) - 12;
    }
}


/* -------------------------
   Icons auf Startposition setzen
------------------------- */

function positionAllAtStart() {

    studentNodes.forEach(icon => {

        // Avatar startet an seiner Intro-Position (auf der Stage),
        // alle anderen an ihrer Hochschul-Startposition
        if (icon === avatarNode && icon.dataset.introX) {

            icon.style.transform =
                `translate(${icon.dataset.introX}px, ${icon.dataset.introY}px)`;

        } else {

            icon.style.transform =
                `translate(${icon.dataset.startX}px, ${icon.dataset.startY}px)`;
        }
    });
}


/* -------------------------
   Scrollanimation
------------------------- */

// Phasen-Schwellen
const P_INTRO         = 0.05;   // Intro-Box einblenden
const P_AVATAR        = 0.15;   // Avatar-Stage einblenden
const P_UNIVERSITY    = 0.30;   // Hochschulkasten + alle Icons
const P_AVATAR_MOVE   = 0.25;   // Avatar wandert in Hochschulkasten (leicht vor University)
const P_AVATAR_ARRIVE = 0.33;   // Avatar ist angekommen
const P_SECTORS       = 0.42;   // Sektoren einblenden
const P_ICONS_START   = 0.52;   // Alle Icons beginnen zu wandern
const P_ICONS_END     = 0.88;   // Alle Icons angekommen
const P_PERCENT       = 0.90;   // Prozentzahlen

function updateStudentPositions(progress) {

    studentNodes.forEach(icon => {

        if (icon === avatarNode) {

            // Avatar hat zwei Phasen:
            // 1) Intro → Hochschulposition  (P_AVATAR_MOVE bis P_AVATAR_ARRIVE)
            // 2) Hochschulposition → Ziel   (P_ICONS_START bis P_ICONS_END)

            const introX  = Number(icon.dataset.introX  || icon.dataset.startX);
            const introY  = Number(icon.dataset.introY  || icon.dataset.startY);
            const startX  = Number(icon.dataset.startX);
            const startY  = Number(icon.dataset.startY);
            const endX    = Number(icon.dataset.endX);
            const endY    = Number(icon.dataset.endY);

            let x, y;

            if (progress < P_AVATAR_MOVE) {

                // Avatar steht auf der Stage
                x = introX;
                y = introY;

            } else if (progress < P_AVATAR_ARRIVE) {

                // Wandert in Hochschulkasten
                const t = (progress - P_AVATAR_MOVE) / (P_AVATAR_ARRIVE - P_AVATAR_MOVE);
                x = introX + (startX - introX) * t;
                y = introY + (startY - introY) * t;

            } else if (progress < P_ICONS_START) {

                // Wartet im Hochschulkasten
                x = startX;
                y = startY;

            } else {

                // Wandert zum Zielsektor
                const t = Math.min(
                    (progress - P_ICONS_START) / (P_ICONS_END - P_ICONS_START),
                    1
                );
                x = startX + (endX - startX) * t;
                y = startY + (endY - startY) * t;
            }

            icon.style.transform = `translate(${x}px, ${y}px)`;

        } else {

            // Alle anderen Icons: einheitliche Bewegung
            const t = Math.min(
                Math.max((progress - P_ICONS_START) / (P_ICONS_END - P_ICONS_START), 0),
                1
            );

            const startX = Number(icon.dataset.startX);
            const startY = Number(icon.dataset.startY);
            const endX   = Number(icon.dataset.endX);
            const endY   = Number(icon.dataset.endY);

            icon.style.transform =
                `translate(${startX + (endX - startX) * t}px, ${startY + (endY - startY) * t}px)`;
        }
    });
}


/* -------------------------
   Story-Steuerung
------------------------- */

function setupScrollStory() {

    const scene      = document.getElementById('career-scene');
    const intro      = document.getElementById('intro-box');
    const avatarStage = document.getElementById('avatar-stage');
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

        intro.classList.toggle('phase-visible', progress > P_INTRO);

        avatarStage.classList.toggle('phase-visible', progress > P_AVATAR);

        // Avatar-Icon direkt mit Avatar-Stage einblenden,
        // restliche Icons erst mit dem Hochschulkasten
        studentNodes.forEach(icon => {
            if (icon === avatarNode) {
                icon.classList.toggle('visible', progress > P_AVATAR);
            } else {
                icon.classList.toggle('visible', progress > P_UNIVERSITY);
            }
        });

        // Avatar-Stage ausblenden sobald Hochschulkasten erscheint
        avatarStage.classList.toggle('phase-hidden-out', progress > P_UNIVERSITY);

        university.classList.toggle('phase-visible', progress > P_UNIVERSITY);

        sectors.classList.toggle('phase-visible', progress > P_SECTORS);

        // Zielpositionen neu berechnen (sticky-Elemente verschieben sich)
        calculateTargets();

        updateStudentPositions(progress);

        document.getElementById('military-percent')
            .classList.toggle('visible', progress > P_PERCENT);

        document.getElementById('civil-percent')
            .classList.toggle('visible', progress > P_PERCENT);
    });
}