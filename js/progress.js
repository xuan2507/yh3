/* ========================================
   Progress Tracker
   ======================================== */

if (!Auth.isLoggedIn()) window.location.href = 'login.html';
Auth.updateUserDisplay();

const SUBJECTS = [
    { id: 'physics', name: 'Physics', icon: 'fa-atom', color: '#6366f1' },
    { id: 'chemistry', name: 'Chemistry', icon: 'fa-flask', color: '#10b981' },
    { id: 'biology', name: 'Biology', icon: 'fa-dna', color: '#ec4899' },
    { id: 'maths', name: 'Mathematics', icon: 'fa-square-root-alt', color: '#f59e0b' },
    { id: 'addmaths', name: 'Add. Maths', icon: 'fa-function', color: '#f97316' },
    { id: 'economics', name: 'Economics', icon: 'fa-chart-line', color: '#8b5cf6' },
    { id: 'business', name: 'Business', icon: 'fa-briefcase', color: '#06b6d4' },
    { id: 'accounting', name: 'Accounting', icon: 'fa-calculator', color: '#84cc16' },
    { id: 'english', name: 'English', icon: 'fa-book', color: '#ef4444' },
    { id: 'chinese', name: 'Chinese', icon: 'fa-language', color: '#eab308' },
    { id: 'psychology', name: 'Psychology', icon: 'fa-brain', color: '#d946ef' },
    { id: 'ielts', name: 'IELTS', icon: 'fa-globe', color: '#3b82f6' }
];

const ACHIEVEMENTS = [
    { id: 'first_quiz', name: 'First Steps', desc: 'Complete your first quiz', icon: 'fa-shoe-prints' },
    { id: 'perfect_score', name: 'Perfectionist', desc: 'Score 100% on a quiz', icon: 'fa-star' },
    { id: 'streak_3', name: 'On Fire', desc: '3-day study streak', icon: 'fa-fire' },
    { id: 'streak_7', name: 'Unstoppable', desc: '7-day study streak', icon: 'fa-fire-alt' },
    { id: 'five_quizzes', name: 'Quiz Master', desc: 'Complete 5 quizzes', icon: 'fa-graduation-cap' },
    { id: 'ten_quizzes', name: 'Exam Ready', desc: 'Complete 10 quizzes', icon: 'fa-scroll' },
    { id: 'tutor_user', name: 'Curious Mind', desc: 'Ask 5 questions to the AI Tutor', icon: 'fa-robot' },
    { id: 'all_subjects', name: 'Well Rounded', desc: 'Take a quiz in 3+ subjects', icon: 'fa-globe' }
];

function loadProgress() {
    const user = Auth.getUser();
    const stats = user.stats || {};
    const progress = user.progress || {};

    // Overview stats
    document.getElementById('streakValue').textContent = stats.streak || 0;
    document.getElementById('hoursValue').textContent = stats.hours || 0;
    document.getElementById('quizzesValue').textContent = stats.quizzesTaken || 0;
    document.getElementById('avgValue').textContent = (stats.avgScore || 0) + '%';

    // Subject score bars
    const barsContainer = document.getElementById('subjectBars');
    barsContainer.innerHTML = SUBJECTS.map(s => {
        const p = progress[s.id] || { scores: [] };
        const scores = p.scores || [];
        let avg = 0;
        if (scores.length > 0) {
            avg = Math.round(scores.reduce((a, sc) => a + (sc.score / sc.total * 100), 0) / scores.length);
        }
        return `
            <div class="sub-bar">
                <div class="sub-bar-label">
                    <span><i class="fas ${s.icon}" style="color:${s.color}"></i> ${s.name}</span>
                    <span>${avg}%</span>
                </div>
                <div class="sub-bar-track">
                    <div class="sub-bar-fill" style="width:${avg}%;background:${s.color}"></div>
                </div>
                <div class="sub-bar-meta">${scores.length} quiz${scores.length !== 1 ? 'zes' : ''} · ${Math.round((p.timeSpent || 0) / 60 * 10) / 10}h studied</div>
            </div>
        `;
    }).join('');

    // Recent activity
    const activityList = document.getElementById('activityList');
    let activities = [];
    Object.entries(progress).forEach(([subj, p]) => {
        (p.scores || []).forEach(sc => {
            activities.push({ type: 'quiz', subject: subj, date: sc.date, score: sc.score, total: sc.total });
        });
    });
    (user.tutorHistory || []).filter(h => h.role === 'user').forEach(h => {
        activities.push({ type: 'tutor', date: h.time, text: h.content });
    });
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));
    const recent = activities.slice(0, 10);

    if (recent.length === 0) {
        activityList.innerHTML = '<div class="activity-empty">No activity yet. Start a quiz or ask the AI Tutor!</div>';
    } else {
        activityList.innerHTML = recent.map(act => {
            const date = new Date(act.date);
            const timeStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
            if (act.type === 'quiz') {
                const subj = SUBJECTS.find(s => s.id === act.subject);
                const pct = Math.round(act.score / act.total * 100);
                return `
                    <div class="activity-item">
                        <div class="activity-icon" style="background:${subj ? subj.color : '#6366f1'}20;color:${subj ? subj.color : '#6366f1'}"><i class="fas fa-question-circle"></i></div>
                        <div class="activity-info">
                            <div class="activity-title">Quiz: ${subj ? subj.name : act.subject} — ${pct}%</div>
                            <div class="activity-time">${timeStr}</div>
                        </div>
                    </div>
                `;
            } else {
                return `
                    <div class="activity-item">
                        <div class="activity-icon" style="background:rgba(99,102,241,0.1);color:#6366f1"><i class="fas fa-robot"></i></div>
                        <div class="activity-info">
                            <div class="activity-title">AI Tutor: "${act.text.substring(0, 40)}${act.text.length > 40 ? '...' : ''}"</div>
                            <div class="activity-time">${timeStr}</div>
                        </div>
                    </div>
                `;
            }
        }).join('');
    }

    // Subject progress grid
    const spg = document.getElementById('subjectProgressGrid');
    spg.innerHTML = SUBJECTS.map(s => {
        const p = progress[s.id] || { completed: [], scores: [], timeSpent: 0 };
        const quizCount = (p.scores || []).length;
        const timeHrs = Math.round((p.timeSpent || 0) / 60 * 10) / 10;
        // Calculate "completion" based on quiz attempts + time
        const completion = Math.min(100, quizCount * 10 + timeHrs * 5);
        return `
            <div class="spg-card">
                <div class="spg-header">
                    <div class="spg-icon" style="background:${s.color}20;color:${s.color}"><i class="fas ${s.icon}"></i></div>
                    <div class="spg-name">${s.name}</div>
                </div>
                <div class="spg-ring">
                    <svg viewBox="0 0 36 36">
                        <path class="spg-ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path class="spg-ring-fill" stroke-dasharray="${completion}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" style="stroke:${s.color}" />
                    </svg>
                    <div class="spg-percent">${Math.round(completion)}%</div>
                </div>
                <div class="spg-meta">
                    <span>${quizCount} quizzes</span>
                    <span>${timeHrs}h</span>
                </div>
            </div>
        `;
    }).join('');

    // Achievements
    checkAchievements(user);
    const earned = user.achievements || [];
    const ag = document.getElementById('achievementsGrid');
    ag.innerHTML = ACHIEVEMENTS.map(ach => {
        const has = earned.includes(ach.id);
        return `
            <div class="ach-card ${has ? 'ach-earned' : 'ach-locked'}">
                <div class="ach-icon"><i class="fas ${ach.icon}"></i></div>
                <div class="ach-name">${ach.name}</div>
                <div class="ach-desc">${ach.desc}</div>
                ${has ? '<div class="ach-badge"><i class="fas fa-check"></i></div>' : '<div class="ach-lock"><i class="fas fa-lock"></i></div>'}
            </div>
        `;
    }).join('');
}

function checkAchievements(user) {
    const stats = user.stats || {};
    const progress = user.progress || {};
    const earned = user.achievements || [];
    const newAch = [];

    const quizCount = stats.quizzesTaken || 0;
    const allScores = Object.values(progress).flatMap(p => p.scores || []);
    const hasPerfect = allScores.some(s => s.score === s.total);
    const subjectsTested = new Set(allScores.map(s => {
        // Find subject from progress keys
        for (const [k, v] of Object.entries(progress)) {
            if (v.scores && v.scores.includes(s)) return k;
        }
        return null;
    })).size;
    const tutorQs = (user.tutorHistory || []).filter(h => h.role === 'user').length;

    if (quizCount >= 1 && !earned.includes('first_quiz')) newAch.push('first_quiz');
    if (hasPerfect && !earned.includes('perfect_score')) newAch.push('perfect_score');
    if ((stats.streak || 0) >= 3 && !earned.includes('streak_3')) newAch.push('streak_3');
    if ((stats.streak || 0) >= 7 && !earned.includes('streak_7')) newAch.push('streak_7');
    if (quizCount >= 5 && !earned.includes('five_quizzes')) newAch.push('five_quizzes');
    if (quizCount >= 10 && !earned.includes('ten_quizzes')) newAch.push('ten_quizzes');
    if (tutorQs >= 5 && !earned.includes('tutor_user')) newAch.push('tutor_user');
    if (subjectsTested >= 3 && !earned.includes('all_subjects')) newAch.push('all_subjects');

    if (newAch.length > 0) {
        user.achievements = [...earned, ...newAch];
        Auth.saveUser(user);
    }
}

loadProgress();
