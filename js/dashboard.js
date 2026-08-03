

// ========================================
// Smart Insights Widgets
// ========================================

function loadInsights() {
    loadDecayAlerts();
    loadExamPredictor();
    loadActiveGoals();
}

function loadDecayAlerts() {
    const body = document.getElementById('decayBody');
    if (!body) return;
    const alerts = Auth.getMemoryDecayAlerts();
    if (alerts.length === 0) {
        body.innerHTML = '<p class="insight-empty"><i class="fas fa-check-circle" style="color:#10b981"></i> All topics fresh. Great job!</p>';
        return;
    }
    const top = alerts.slice(0, 4);
    body.innerHTML = top.map(a => `
        <div class="insight-item">
            <div>
                <div class="insight-item-name">${a.topic}</div>
                <div style="font-size:0.75rem;color:var(--text-muted)">${capitalize(a.subject)} · ${a.daysSince} days since revision</div>
            </div>
            <span class="insight-item-badge ${a.urgency}">${a.urgency}</span>
        </div>
    `).join('');
}

function loadExamPredictor() {
    const body = document.getElementById('predictorBody');
    if (!body) return;
    const subjects = ['physics', 'chemistry', 'maths', 'biology', 'economics'];
    let predictions = [];
    subjects.forEach(sub => {
        const preds = Auth.getExamPredictions(sub);
        if (preds.length > 0) {
            predictions.push({ subject: sub, top: preds[0] });
        }
    });
    if (predictions.length === 0) {
        body.innerHTML = '<p class="insight-empty">Take quizzes to unlock predictions.</p>';
        return;
    }
    predictions.sort((a, b) => a.top.score - b.top.score);
    const top = predictions.slice(0, 3);
    body.innerHTML = top.map(p => `
        <div class="insight-item">
            <div>
                <div class="insight-item-name">${capitalize(p.subject)}: ${p.top.topic}</div>
                <div style="font-size:0.75rem;color:var(--text-muted)">Priority: ${p.top.source === 'both' ? 'High' : 'Medium'}</div>
            </div>
            <span class="insight-item-badge high">Revise</span>
        </div>
    `).join('');
}

function loadActiveGoals() {
    const body = document.getElementById('goalsBody');
    if (!body) return;
    const goals = Auth.getGoals().filter(g => !g.completed);
    if (goals.length === 0) {
        body.innerHTML = '<p class="insight-empty">No active goals. <a href="goals.html">Set one now</a>.</p>';
        return;
    }
    const top = goals.slice(0, 3);
    body.innerHTML = top.map(g => {
        const gradeMap = { 'A*': 95, 'A': 85, 'B': 75, 'C': 65 };
        const targetPct = gradeMap[g.targetGrade] || 80;
        const currentPct = ({ 'A*': 95, 'A': 85, 'B': 75, 'C': 65, 'D': 55, 'E': 45, 'U': 0 }[g.currentGrade] || 0);
        const progress = Math.min(100, Math.round((currentPct / targetPct) * 100));
        return `
            <div class="insight-item">
                <div style="flex:1">
                    <div class="insight-item-name">${capitalize(g.subject)} → ${g.targetGrade}</div>
                    <div class="insight-progress"><div style="width:${progress}%"></div></div>
                </div>
                <span style="font-size:0.8rem;font-weight:700;color:var(--primary)">${progress}%</span>
            </div>
        `;
    }).join('');
}

function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

// ========================================
// Daily Challenge
// ========================================

function loadDailyChallenge() {
    const card = document.getElementById('challengeCard');
    const text = document.getElementById('challengeText');
    const streakEl = document.getElementById('challengeStreak');
    const btn = document.getElementById('challengeBtn');
    if (!card) return;

    const today = new Date().toDateString();
    const user = Auth.getUser();
    const challenge = user?.dailyChallenge || { lastDate: null, streak: 0, completed: false };

    // Check if new day
    if (challenge.lastDate !== today) {
        challenge.completed = false;
        challenge.lastDate = today;
    }

    streakEl.innerHTML = `<i class="fas fa-fire"></i> <span>${challenge.streak}</span> day${challenge.streak !== 1 ? 's' : ''}`;

    if (challenge.completed) {
        card.classList.add('challenge-completed');
        text.textContent = "Today's challenge completed! Come back tomorrow.";
        btn.textContent = 'Completed';
        btn.classList.add('btn-success');
        btn.classList.remove('btn-primary');
        btn.href = '#';
        btn.onclick = (e) => e.preventDefault();
    } else {
        card.classList.remove('challenge-completed');
        text.textContent = "Complete today's quick quiz to keep your streak alive!";
        btn.textContent = 'Start Challenge';
        btn.classList.remove('btn-success');
        btn.classList.add('btn-primary');
        btn.href = 'quizzes.html?mode=daily';
    }

    // Save back
    if (user) {
        if (!user.dailyChallenge) user.dailyChallenge = challenge;
        else Object.assign(user.dailyChallenge, challenge);
        Auth.saveUser(user);
    }
}

// ========================================
// Subject Grid
// ========================================

const DASH_SUBJECTS = [
    { id: 'physics', name: 'Physics', icon: 'fa-atom', color: '#6366f1', desc: 'Mechanics, waves, electricity, nuclear & quantum physics' },
    { id: 'chemistry', name: 'Chemistry', icon: 'fa-flask', color: '#10b981', desc: 'Physical, organic, inorganic & analytical chemistry' },
    { id: 'maths', name: 'Mathematics', icon: 'fa-square-root-alt', color: '#f59e0b', desc: 'Pure maths, statistics, mechanics & calculus' },
    { id: 'biology', name: 'Biology', icon: 'fa-dna', color: '#ec4899', desc: 'Cell biology, genetics, ecology & physiology' },
    { id: 'economics', name: 'Economics', icon: 'fa-chart-line', color: '#8b5cf6', desc: 'Micro & macroeconomics, trade & development' },
    { id: 'accounting', name: 'Accounting', icon: 'fa-calculator', color: '#f97316', desc: 'Financial statements, partnerships & company accounts' },
    { id: 'ielts', name: 'IELTS', icon: 'fa-language', color: '#06b6d4', desc: 'Speaking, writing, reading & listening prep' }
];

function renderSubjectGrid() {
    const grid = document.getElementById('dashSubjectsGrid');
    if (!grid) return;
    grid.innerHTML = DASH_SUBJECTS.map(s => {
        const progress = Auth.getUser()?.progress?.[s.id];
        const completed = progress?.completed?.length || 0;
        return `
        <div class="subject-card" style="border-top: 3px solid ${s.color}">
            <div class="subject-icon" style="background:${s.color}20;color:${s.color}">
                <i class="fas ${s.icon}"></i>
            </div>
            <h3>${s.name}</h3>
            <p>${s.desc}</p>
            <div class="subject-progress">
                <span>${completed} topics completed</span>
                <a href="${s.id === 'ielts' ? 'ielts.html' : 'quizzes.html'}" class="btn btn-outline btn-sm">Study</a>
            </div>
        </div>`;
    }).join('');
}

// Call on load
document.addEventListener('DOMContentLoaded', () => {
    loadDailyChallenge();
    renderSubjectGrid();
});
