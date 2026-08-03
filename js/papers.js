/* ========================================
   Past Papers Directory
   ======================================== */

if (!Auth.isLoggedIn()) window.location.href = 'login.html';
Auth.updateUserDisplay();

const PAPERS = [
    {
        subject: 'physics', name: 'Physics 9702 (A-Level)',
        code: '9702',
        links: [
            { year: '2026', season: 'Feb/March', type: 'QP', url: 'https://pastpapers.papacambridge.com/papers/caie/as-and-a-level/physics-9702/' },
            { year: '2025', season: 'May/June', type: 'QP', url: 'https://pastpapers.papacambridge.com/papers/caie/as-and-a-level/physics-9702/' },
            { year: '2025', season: 'Oct/Nov', type: 'QP', url: 'https://pastpapers.papacambridge.com/papers/caie/as-and-a-level/physics-9702/' },
            { year: '2024', season: 'May/June', type: 'QP', url: 'https://pastpapers.papacambridge.com/papers/caie/as-and-a-level/physics-9702/' },
            { year: '2024', season: 'Oct/Nov', type: 'QP', url: 'https://pastpapers.papacambridge.com/papers/caie/as-and-a-level/physics-9702/' },
            { year: '2023', season: 'May/June', type: 'QP', url: 'https://pastpapers.papacambridge.com/papers/caie/as-and-a-level/physics-9702/' },
            { year: '2023', season: 'Oct/Nov', type: 'QP', url: 'https://pastpapers.papacambridge.com/papers/caie/as-and-a-level/physics-9702/' },
            { year: '2022', season: 'May/June', type: 'QP', url: 'https://pastpapers.papacambridge.com/papers/caie/as-and-a-level/physics-9702/' },
            { year: '2022', season: 'Oct/Nov', type: 'QP', url: 'https://pastpapers.papacambridge.com/papers/caie/as-and-a-level/physics-9702/' },
        ]
    },
    {
        subject: 'physics', name: 'Physics 0625 (IGCSE)',
        code: '0625',
        links: [
            { year: '2026', season: 'Feb/March', type: 'QP', url: 'https://pastpapers.papacambridge.com/papers/caie/cambridge-igcse/physics-0625/' },
            { year: '2025', season: 'May/June', type: 'QP', url: 'https://pastpapers.papacambridge.com/papers/caie/cambridge-igcse/physics-0625/' },
            { year: '2024', season: 'May/June', type: 'QP', url: 'https://pastpapers.papacambridge.com/papers/caie/cambridge-igcse/physics-0625/' },
            { year: '2023', season: 'May/June', type: 'QP', url: 'https://pastpapers.papacambridge.com/papers/caie/cambridge-igcse/physics-0625/' },
            { year: '2022', season: 'May/June', type: 'QP', url: 'https://pastpapers.papacambridge.com/papers/caie/cambridge-igcse/physics-0625/' },
        ]
    },
    {
        subject: 'chemistry', name: 'Chemistry 9701 (A-Level)',
        code: '9701',
        links: [
            { year: '2026', season: 'Feb/March', type: 'QP', url: 'https://pastpapers.papacambridge.com/papers/caie/as-and-a-level/chemistry-9701/' },
            { year: '2025', season: 'May/June', type: 'QP', url: 'https://pastpapers.papacambridge.com/papers/caie/as-and-a-level/chemistry-9701/' },
            { year: '2024', season: 'May/June', type: 'QP', url: 'https://pastpapers.papacambridge.com/papers/caie/as-and-a-level/chemistry-9701/' },
            { year: '2023', season: 'May/June', type: 'QP', url: 'https://pastpapers.papacambridge.com/papers/caie/as-and-a-level/chemistry-9701/' },
            { year: '2022', season: 'May/June', type: 'QP', url: 'https://pastpapers.papacambridge.com/papers/caie/as-and-a-level/chemistry-9701/' },
        ]
    },
    {
        subject: 'chemistry', name: 'Chemistry 0620 (IGCSE)',
        code: '0620',
        links: [
            { year: '2026', season: 'Feb/March', type: 'QP', url: 'https://pastpapers.papacambridge.com/papers/caie/cambridge-igcse/chemistry-0620/' },
            { year: '2025', season: 'May/June', type: 'QP', url: 'https://pastpapers.papacambridge.com/papers/caie/cambridge-igcse/chemistry-0620/' },
            { year: '2024', season: 'May/June', type: 'QP', url: 'https://pastpapers.papacambridge.com/papers/caie/cambridge-igcse/chemistry-0620/' },
            { year: '2023', season: 'May/June', type: 'QP', url: 'https://pastpapers.papacambridge.com/papers/caie/cambridge-igcse/chemistry-0620/' },
            { year: '2022', season: 'May/June', type: 'QP', url: 'https://pastpapers.papacambridge.com/papers/caie/cambridge-igcse/chemistry-0620/' },
        ]
    },
    {
        subject: 'maths', name: 'Mathematics 9709 (A-Level)',
        code: '9709',
        links: [
            { year: '2026', season: 'Feb/March', type: 'QP', url: 'https://pastpapers.papacambridge.com/papers/caie/as-and-a-level/mathematics-9709/' },
            { year: '2025', season: 'May/June', type: 'QP', url: 'https://pastpapers.papacambridge.com/papers/caie/as-and-a-level/mathematics-9709/' },
            { year: '2024', season: 'May/June', type: 'QP', url: 'https://pastpapers.papacambridge.com/papers/caie/as-and-a-level/mathematics-9709/' },
            { year: '2023', season: 'May/June', type: 'QP', url: 'https://pastpapers.papacambridge.com/papers/caie/as-and-a-level/mathematics-9709/' },
            { year: '2022', season: 'May/June', type: 'QP', url: 'https://pastpapers.papacambridge.com/papers/caie/as-and-a-level/mathematics-9709/' },
        ]
    },
    {
        subject: 'maths', name: 'Mathematics 0580 (IGCSE)',
        code: '0580',
        links: [
            { year: '2026', season: 'Feb/March', type: 'QP', url: 'https://pastpapers.papacambridge.com/papers/caie/cambridge-igcse/mathematics-0580/' },
            { year: '2025', season: 'May/June', type: 'QP', url: 'https://pastpapers.papacambridge.com/papers/caie/cambridge-igcse/mathematics-0580/' },
            { year: '2024', season: 'May/June', type: 'QP', url: 'https://pastpapers.papacambridge.com/papers/caie/cambridge-igcse/mathematics-0580/' },
            { year: '2023', season: 'May/June', type: 'QP', url: 'https://pastpapers.papacambridge.com/papers/caie/cambridge-igcse/mathematics-0580/' },
            { year: '2022', season: 'May/June', type: 'QP', url: 'https://pastpapers.papacambridge.com/papers/caie/cambridge-igcse/mathematics-0580/' },
        ]
    },
    {
        subject: 'maths', name: 'Add. Mathematics 0606 (IGCSE)',
        code: '0606',
        links: [
            { year: '2026', season: 'Feb/March', type: 'QP', url: 'https://pastpapers.papacambridge.com/papers/caie/cambridge-igcse/additional-mathematics-0606/' },
            { year: '2025', season: 'May/June', type: 'QP', url: 'https://pastpapers.papacambridge.com/papers/caie/cambridge-igcse/additional-mathematics-0606/' },
            { year: '2024', season: 'May/June', type: 'QP', url: 'https://pastpapers.papacambridge.com/papers/caie/cambridge-igcse/additional-mathematics-0606/' },
            { year: '2023', season: 'May/June', type: 'QP', url: 'https://pastpapers.papacambridge.com/papers/caie/cambridge-igcse/additional-mathematics-0606/' },
            { year: '2022', season: 'May/June', type: 'QP', url: 'https://pastpapers.papacambridge.com/papers/caie/cambridge-igcse/additional-mathematics-0606/' },
        ]
    },
    {
        subject: 'biology', name: 'Biology 9700 (A-Level)',
        code: '9700',
        links: [
            { year: '2026', season: 'Feb/March', type: 'QP', url: 'https://pastpapers.papacambridge.com/papers/caie/as-and-a-level/biology-9700/' },
            { year: '2025', season: 'May/June', type: 'QP', url: 'https://pastpapers.papacambridge.com/papers/caie/as-and-a-level/biology-9700/' },
            { year: '2024', season: 'May/June', type: 'QP', url: 'https://pastpapers.papacambridge.com/papers/caie/as-and-a-level/biology-9700/' },
            { year: '2023', season: 'May/June', type: 'QP', url: 'https://pastpapers.papacambridge.com/papers/caie/as-and-a-level/biology-9700/' },
            { year: '2022', season: 'May/June', type: 'QP', url: 'https://pastpapers.papacambridge.com/papers/caie/as-and-a-level/biology-9700/' },
        ]
    },
    {
        subject: 'biology', name: 'Biology 0610 (IGCSE)',
        code: '0610',
        links: [
            { year: '2026', season: 'Feb/March', type: 'QP', url: 'https://pastpapers.papacambridge.com/papers/caie/cambridge-igcse/biology-0610/' },
            { year: '2025', season: 'May/June', type: 'QP', url: 'https://pastpapers.papacambridge.com/papers/caie/cambridge-igcse/biology-0610/' },
            { year: '2024', season: 'May/June', type: 'QP', url: 'https://pastpapers.papacambridge.com/papers/caie/cambridge-igcse/biology-0610/' },
            { year: '2023', season: 'May/June', type: 'QP', url: 'https://pastpapers.papacambridge.com/papers/caie/cambridge-igcse/biology-0610/' },
            { year: '2022', season: 'May/June', type: 'QP', url: 'https://pastpapers.papacambridge.com/papers/caie/cambridge-igcse/biology-0610/' },
        ]
    },
    {
        subject: 'economics', name: 'Economics 9708 (A-Level)',
        code: '9708',
        links: [
            { year: '2026', season: 'Feb/March', type: 'QP', url: 'https://pastpapers.papacambridge.com/papers/caie/as-and-a-level/economics-9708/' },
            { year: '2025', season: 'May/June', type: 'QP', url: 'https://pastpapers.papacambridge.com/papers/caie/as-and-a-level/economics-9708/' },
            { year: '2024', season: 'May/June', type: 'QP', url: 'https://pastpapers.papacambridge.com/papers/caie/as-and-a-level/economics-9708/' },
            { year: '2023', season: 'May/June', type: 'QP', url: 'https://pastpapers.papacambridge.com/papers/caie/as-and-a-level/economics-9708/' },
            { year: '2022', season: 'May/June', type: 'QP', url: 'https://pastpapers.papacambridge.com/papers/caie/as-and-a-level/economics-9708/' },
        ]
    },
    {
        subject: 'economics', name: 'Economics 0455 (IGCSE)',
        code: '0455',
        links: [
            { year: '2026', season: 'Feb/March', type: 'QP', url: 'https://pastpapers.papacambridge.com/papers/caie/cambridge-igcse/economics-0455/' },
            { year: '2025', season: 'May/June', type: 'QP', url: 'https://pastpapers.papacambridge.com/papers/caie/cambridge-igcse/economics-0455/' },
            { year: '2024', season: 'May/June', type: 'QP', url: 'https://pastpapers.papacambridge.com/papers/caie/cambridge-igcse/economics-0455/' },
            { year: '2023', season: 'May/June', type: 'QP', url: 'https://pastpapers.papacambridge.com/papers/caie/cambridge-igcse/economics-0455/' },
            { year: '2022', season: 'May/June', type: 'QP', url: 'https://pastpapers.papacambridge.com/papers/caie/cambridge-igcse/economics-0455/' },
        ]
    },
];

const grid = document.getElementById('papersGrid');

function renderPapers(filter = 'all') {
    grid.innerHTML = PAPERS.filter(p => filter === 'all' || p.subject === filter).map(paper => `
        <div class="paper-card" data-subject="${paper.subject}">
            <div class="paper-header">
                <div class="paper-icon"><i class="fas fa-file-pdf"></i></div>
                <div class="paper-title-info">
                    <h3>${paper.name}</h3>
                    <span class="paper-code">Code ${paper.code}</span>
                </div>
            </div>
            <div class="paper-links">
                ${paper.links.map(l => `
                    <a href="${l.url}" target="_blank" rel="noopener" class="paper-link">
                        <span class="pl-year">${l.year}</span>
                        <span class="pl-season">${l.season}</span>
                        <i class="fas fa-external-link-alt"></i>
                    </a>
                `).join('')}
            </div>
        </div>
    `).join('');
}

renderPapers();

// Filter buttons
document.querySelectorAll('.papers-filters .filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.papers-filters .filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderPapers(btn.dataset.filter);
    });
});
