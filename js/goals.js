/* ========================================
   Goal Engine
   ======================================== */

const GoalEngine = {
    init() {
        if (!Auth.protectRoute()) return;
        Auth.updateUserDisplay();
        this.renderGoals();
        this.bindEvents();
    },

    bindEvents() {
        document.getElementById('addGoalForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const subject = document.getElementById('goalSubject').value;
            const targetGrade = document.getElementById('goalGrade').value;
            const deadline = document.getElementById('goalDeadline').value;
            if (!deadline) return;
            Auth.addGoal(subject, targetGrade, deadline);
            this.renderGoals();
            e.target.reset();
        });
    },

    renderGoals() {
        const goals = Auth.getGoals();
        const container = document.getElementById('goalsList');
        if (goals.length === 0) {
            container.innerHTML = `
                <div class="goals-empty">
                    <i class="fas fa-bullseye"></i>
                    <p>No goals yet. Set your first target above!</p>
                </div>`;
            return;
        }

        container.innerHTML = goals.map(g => {
            const gradeMap = { 'A*': 95, 'A': 85, 'B': 75, 'C': 65, 'D': 55, 'E': 45 };
            const targetPct = gradeMap[g.targetGrade] || 80;
            const currentPct = ({ 'A*': 95, 'A': 85, 'B': 75, 'C': 65, 'D': 55, 'E': 45, 'U': 0 }[g.currentGrade] || 0);
            const progress = Math.min(100, Math.round((currentPct / targetPct) * 100));
            const isOverdue = new Date(g.deadline) < new Date();

            return `
                <div class="goal-item ${g.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}">
                    <div class="goal-header">
                        <div class="goal-info">
                            <span class="goal-subject-badge">${this.capitalize(g.subject)}</span>
                            <span class="goal-grade">Target: <b>${g.targetGrade}</b></span>
                            <span class="goal-current">Current: <b>${g.currentGrade}</b></span>
                        </div>
                        <div class="goal-meta">
                            <span class="goal-deadline"><i class="fas fa-calendar"></i> ${new Date(g.deadline).toLocaleDateString()}</span>
                            <span class="goal-days">${g.daysLeft} days left</span>
                        </div>
                    </div>
                    <div class="goal-progress-bar">
                        <div class="goal-progress-fill" style="width:${progress}%"></div>
                    </div>
                    <div class="goal-stats">
                        <span><i class="fas fa-chart-line"></i> ${progress}% to target</span>
                        <span><i class="fas fa-clock"></i> ${g.dailyTargetHours}h/day needed</span>
                        <span><i class="fas fa-arrow-up"></i> +${g.gap}% gap</span>
                    </div>
                    ${g.completed ? '<div class="goal-completed-badge"><i class="fas fa-trophy"></i> Goal Achieved!</div>' : ''}
                    <button class="btn btn-danger btn-sm goal-delete" onclick="GoalEngine.deleteGoal('${g.id}')"><i class="fas fa-trash"></i></button>
                </div>
            `;
        }).join('');
    },

    deleteGoal(id) {
        if (!confirm('Delete this goal?')) return;
        Auth.removeGoal(id);
        this.renderGoals();
    },

    capitalize(s) {
        return s.charAt(0).toUpperCase() + s.slice(1);
    }
};

document.addEventListener('DOMContentLoaded', () => GoalEngine.init());
