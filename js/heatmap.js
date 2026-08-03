/* ========================================
   Weakness Heatmap
   ======================================== */

const SYLLABUS = {
    physics: ['Forces & Motion', 'Work & Energy', 'Thermal Physics', 'Waves', 'Electricity', 'Magnetism', 'Nuclear Physics', 'Astrophysics', 'Quantum Physics', 'Oscillations', 'Gravitation', 'Electric Fields', 'Capacitors', 'Electromagnetism', 'Particle Physics'],
    chemistry: ['Atomic Structure', 'Chemical Bonding', 'Energetics', 'Kinetics', 'Equilibrium', 'Redox', 'Inorganic Chemistry', 'Organic Chemistry', 'Analytical Chemistry', 'Transition Metals', 'Electrochemistry', 'Acids & Bases', 'Group Chemistry', 'Polymers', 'Biochemistry'],
    maths: ['Algebra', 'Coordinate Geometry', 'Trigonometry', 'Calculus', 'Vectors', 'Complex Numbers', 'Matrices', 'Probability', 'Statistics', 'Mechanics', 'Differential Equations', 'Numerical Methods', 'Proof', 'Sequences', 'Transformations'],
    biology: ['Cell Biology', 'Biochemistry', 'DNA & Genetics', 'Ecology', 'Physiology', 'Evolution', 'Biotechnology', 'Plant Biology', 'Immunology', 'Neurobiology', 'Reproduction', 'Homeostasis', 'Respiration', 'Photosynthesis', 'Microbiology'],
    economics: ['Microeconomics', 'Macroeconomics', 'International Trade', 'Development', 'Labour Markets', 'Market Structures', 'Market Failure', 'Fiscal Policy', 'Monetary Policy', 'Exchange Rates', 'Balance of Payments', 'Inflation', 'Unemployment', 'Economic Growth', 'Behavioural Economics']
};

const Heatmap = {
    currentSubject: 'physics',

    init() {
        if (!Auth.protectRoute()) return;
        Auth.updateUserDisplay();
        this.bindEvents();
        this.render();
    },

    bindEvents() {
        document.getElementById('heatmapTabs').addEventListener('click', (e) => {
            if (e.target.classList.contains('heatmap-tab')) {
                document.querySelectorAll('.heatmap-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                this.currentSubject = e.target.dataset.subject;
                this.render();
            }
        });
    },

    render() {
        const topics = SYLLABUS[this.currentSubject] || [];
        const mastery = Auth.getTopicMastery(this.currentSubject);
        const grid = document.getElementById('heatmapGrid');

        grid.innerHTML = topics.map(topic => {
            const data = mastery[topic] || { score: 0, attempts: 0, lastSeen: null, correctStreak: 0 };
            const color = this.getColor(data.score, data.attempts);
            const label = data.attempts === 0 ? 'Not attempted' : `${Math.round(data.score)}% · ${data.attempts} tries`;
            return `
                <div class="heatmap-cell" style="background:${color.bg};border-color:${color.border};color:${color.text}">
                    <div class="heatmap-topic">${topic}</div>
                    <div class="heatmap-score">${label}</div>
                    ${data.correctStreak >= 3 ? '<div class="heatmap-streak"><i class="fas fa-fire"></i> ' + data.correctStreak + '</div>' : ''}
                </div>
            `;
        }).join('');

        this.renderSummary(topics, mastery);
    },

    getColor(score, attempts) {
        if (attempts === 0) return { bg: 'var(--bg-light)', border: 'var(--border)', text: 'var(--text-muted)' };
        if (score < 50) return { bg: 'rgba(239,68,68,0.12)', border: '#ef4444', text: '#ef4444' };
        if (score < 75) return { bg: 'rgba(245,158,11,0.12)', border: '#f59e0b', text: '#f59e0b' };
        return { bg: 'rgba(16,185,129,0.12)', border: '#10b981', text: '#10b981' };
    },

    renderSummary(topics, mastery) {
        const attempted = topics.filter(t => (mastery[t]?.attempts || 0) > 0).length;
        const strong = topics.filter(t => (mastery[t]?.score || 0) >= 75).length;
        const weak = topics.filter(t => {
            const m = mastery[t];
            return m && m.attempts > 0 && m.score < 50;
        }).length;
        const avg = attempted > 0
            ? Math.round(topics.filter(t => mastery[t]?.attempts > 0).reduce((a, t) => a + (mastery[t].score || 0), 0) / attempted)
            : 0;

        document.getElementById('heatmapSummary').innerHTML = `
            <div class="summary-card">
                <div class="summary-item"><b>${attempted}</b> / ${topics.length} topics attempted</div>
                <div class="summary-item"><b>${strong}</b> topics mastered</div>
                <div class="summary-item"><b>${weak}</b> topics weak</div>
                <div class="summary-item"><b>${avg}%</b> average mastery</div>
            </div>
        `;
    }
};

document.addEventListener('DOMContentLoaded', () => Heatmap.init());
