

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
