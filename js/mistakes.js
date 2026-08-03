/* ========================================
   Mistake Library
   ======================================== */

const MistakeLibrary = {
    init() {
        if (!Auth.protectRoute()) return;
        Auth.updateUserDisplay();
        this.renderStats();
        this.renderList();
        this.bindEvents();
    },

    renderStats() {
        const mistakes = Auth.getMistakes();
        const total = mistakes.length;
        const mastered = mistakes.filter(m => m.mastered).length;
        const pending = total - mastered;
        document.getElementById('totalMistakes').textContent = total;
        document.getElementById('masteredMistakes').textContent = mastered;
        document.getElementById('pendingMistakes').textContent = pending;

        const patterns = Auth.getMistakePatterns();
        document.getElementById('topWeakTopic').textContent = patterns.length ? patterns[0][0] : '-';
    },

    renderList() {
        const subject = document.getElementById('subjectFilter').value;
        const status = document.getElementById('statusFilter').value;
        let mistakes = Auth.getMistakes(subject);
        if (status === 'pending') mistakes = mistakes.filter(m => !m.mastered);
        if (status === 'mastered') mistakes = mistakes.filter(m => m.mastered);

        const container = document.getElementById('mistakeList');
        if (mistakes.length === 0) {
            container.innerHTML = `
                <div class="mistake-empty">
                    <i class="fas fa-check-circle"></i>
                    <p>No mistakes found. Keep up the great work!</p>
                </div>`;
            return;
        }

        container.innerHTML = mistakes.map(m => `
            <div class="mistake-card ${m.mastered ? 'mastered' : ''}">
                <div class="mistake-meta">
                    <span class="mistake-subject-badge">${this.capitalize(m.subject)}</span>
                    <span class="mistake-topic">${m.topic}</span>
                    <span class="mistake-date">${new Date(m.timestamp).toLocaleDateString()}</span>
                </div>
                <div class="mistake-question">${m.question}</div>
                <div class="mistake-answers">
                    <div class="mistake-wrong"><i class="fas fa-times"></i> Your answer: ${m.userAnswer}</div>
                    <div class="mistake-correct"><i class="fas fa-check"></i> Correct: ${m.correctAnswer}</div>
                </div>
                <div class="mistake-explanation">${m.explanation}</div>
                <div class="mistake-actions">
                    ${m.mastered
                        ? `<button class="btn btn-outline btn-sm" onclick="MistakeLibrary.unmaster('${m.id}')"><i class="fas fa-undo"></i> Unmark</button>`
                        : `<button class="btn btn-primary btn-sm" onclick="MistakeLibrary.master('${m.id}')"><i class="fas fa-check"></i> Mark Mastered</button>`
                    }
                    <button class="btn btn-danger btn-sm" onclick="MistakeLibrary.remove('${m.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `).join('');
    },

    bindEvents() {
        document.getElementById('subjectFilter').addEventListener('change', () => this.renderList());
        document.getElementById('statusFilter').addEventListener('change', () => this.renderList());
        document.getElementById('practiceMistakesBtn').addEventListener('click', () => this.startRevisionQuiz());
        document.getElementById('closeRevisionModal').addEventListener('click', () => {
            document.getElementById('revisionQuizModal').classList.remove('active');
        });
    },

    master(id) {
        Auth.markMistakeMastered(id);
        this.renderStats();
        this.renderList();
    },

    unmaster(id) {
        const user = Auth.getUser();
        const m = user.mistakes.find(x => x.id === id);
        if (m) { m.mastered = false; Auth.saveUser(user); }
        this.renderStats();
        this.renderList();
    },

    remove(id) {
        if (!confirm('Delete this mistake record?')) return;
        Auth.removeMistake(id);
        this.renderStats();
        this.renderList();
    },

    startRevisionQuiz() {
        const questions = Auth.generateRevisionQuiz(10);
        if (questions.length === 0) {
            alert('No mistakes to practice! You\'re all caught up.');
            return;
        }
        this.revisionQuestions = questions;
        this.revisionIndex = 0;
        this.revisionScore = 0;
        document.getElementById('revisionQuizModal').classList.add('active');
        this.showRevisionQuestion();
    },

    showRevisionQuestion() {
        const q = this.revisionQuestions[this.revisionIndex];
        const container = document.getElementById('revisionQuizContainer');
        const progress = ((this.revisionIndex) / this.revisionQuestions.length) * 100;

        container.innerHTML = `
            <div class="revision-progress"><div class="revision-progress-bar" style="width:${progress}%"></div></div>
            <div class="revision-counter">Question ${this.revisionIndex + 1} of ${this.revisionQuestions.length}</div>
            <div class="revision-question">${q.question}</div>
            <div class="revision-options">
                ${q.options.map((opt, i) => `<button class="revision-option" data-index="${i}">${opt}</button>`).join('')}
            </div>
            <div class="revision-feedback" id="revisionFeedback"></div>
        `;

        container.querySelectorAll('.revision-option').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleRevisionAnswer(e.target, q));
        });
    },

    handleRevisionAnswer(btn, q) {
        const selected = btn.textContent.trim();
        const correct = q.options[0] === selected; // options were shuffled, correct is always index 0 in data but we need to check
        // Actually options were shuffled, so we need to know which is correct
        // Let's fix: in generateRevisionQuiz, we need to track the correct answer separately
        // The correct answer is the first option before shuffling... but we shuffled.
        // Let me fix the quiz generation to store correct answer text.

        // For now, since the correct answer text is known:
        const isCorrect = selected === q.correct;
        const feedback = document.getElementById('revisionFeedback');

        if (isCorrect) {
            btn.classList.add('correct');
            feedback.innerHTML = `<div class="feedback-correct"><i class="fas fa-check"></i> Correct! ${q.explanation}</div>`;
            this.revisionScore++;
            if (q.mistakeId) Auth.markMistakeMastered(q.mistakeId);
        } else {
            btn.classList.add('wrong');
            feedback.innerHTML = `<div class="feedback-wrong"><i class="fas fa-times"></i> Not quite. Correct: ${q.correct}. ${q.explanation}</div>`;
        }

        document.querySelectorAll('.revision-option').forEach(b => b.disabled = true);

        setTimeout(() => {
            this.revisionIndex++;
            if (this.revisionIndex < this.revisionQuestions.length) {
                this.showRevisionQuestion();
            } else {
                this.showRevisionResults();
            }
        }, 2500);
    },

    showRevisionResults() {
        const container = document.getElementById('revisionQuizContainer');
        const pct = Math.round((this.revisionScore / this.revisionQuestions.length) * 100);
        container.innerHTML = `
            <div class="revision-results">
                <div class="revision-result-score">${this.revisionScore}/${this.revisionQuestions.length}</div>
                <div class="revision-result-label">Mistakes Mastered</div>
                <div class="revision-result-bar"><div style="width:${pct}%"></div></div>
                <p>${pct >= 80 ? 'Excellent! You\'re turning weaknesses into strengths.' : 'Keep practicing! Repetition is key.'}</p>
                <button class="btn btn-primary" onclick="document.getElementById('revisionQuizModal').classList.remove('active');">Done</button>
            </div>
        `;
        this.renderStats();
        this.renderList();
    },

    capitalize(s) {
        return s.charAt(0).toUpperCase() + s.slice(1);
    }
};

document.addEventListener('DOMContentLoaded', () => MistakeLibrary.init());
