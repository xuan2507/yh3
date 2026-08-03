/* ========================================
   LearnAI Backend API Client
   ======================================== */

const API_BASE = localStorage.getItem('api_base') || '';

const ApiClient = {
    token: localStorage.getItem('learnai_token') || null,

    async request(method, endpoint, body = null) {
        if (!API_BASE) return null; // fallback to localStorage mode
        const url = `${API_BASE}${endpoint}`;
        const opts = {
            method,
            headers: { 'Content-Type': 'application/json' }
        };
        if (this.token) opts.headers['Authorization'] = `Bearer ${this.token}`;
        if (body) opts.body = JSON.stringify(body);

        try {
            const res = await fetch(url, opts);
            if (res.status === 401) {
                this.token = null;
                localStorage.removeItem('learnai_token');
            }
            if (!res.ok) throw new Error(await res.text());
            return await res.json();
        } catch (err) {
            console.error('API error:', err);
            return null;
        }
    },

    // Auth
    async register(userData) {
        const data = await this.request('POST', '/api/auth/register', userData);
        if (data?.token) { this.token = data.token; localStorage.setItem('learnai_token', data.token); }
        return data;
    },
    async login(email, password) {
        const data = await this.request('POST', '/api/auth/login', { email, password });
        if (data?.token) { this.token = data.token; localStorage.setItem('learnai_token', data.token); }
        return data;
    },
    async getMe() { return this.request('GET', '/api/auth/me'); },

    // Quizzes
    saveQuizResult(subject, score, total, topic) {
        return this.request('POST', '/api/quizzes/results', { subject, score, total, topic });
    },
    getQuizResults(subject) {
        const q = subject ? `?subject=${subject}` : '';
        return this.request('GET', `/api/quizzes/results${q}`);
    },
    getQuizStats() {
        return this.request('GET', '/api/quizzes/stats');
    },

    // Mistakes
    addMistake(subject, question, correctAnswer, userAnswer, explanation, topic) {
        return this.request('POST', '/api/mistakes', { subject, question, correctAnswer, userAnswer, explanation, topic });
    },
    getMistakes(subject, mastered) {
        let q = [];
        if (subject) q.push(`subject=${subject}`);
        if (mastered !== undefined) q.push(`mastered=${mastered}`);
        return this.request('GET', `/api/mistakes${q.length ? '?' + q.join('&') : ''}`);
    },
    markMistakeMastered(id) { return this.request('PATCH', `/api/mistakes/${id}/mastered`); },
    removeMistake(id) { return this.request('DELETE', `/api/mistakes/${id}`); },
    getMistakePatterns() { return this.request('GET', '/api/mistakes/patterns'); },

    // Goals
    addGoal(subject, targetGrade, deadline) {
        return this.request('POST', '/api/goals', { subject, targetGrade, deadline });
    },
    getGoals() { return this.request('GET', '/api/goals'); },
    updateGoalProgress(id, currentScore) {
        return this.request('PATCH', `/api/goals/${id}/progress`, { currentScore });
    },
    removeGoal(id) { return this.request('DELETE', `/api/goals/${id}`); },

    // Mastery
    updateTopicMastery(subject, topic, correct) {
        return this.request('POST', '/api/mastery', { subject, topic, correct });
    },
    getTopicMastery(subject) {
        return this.request('GET', `/api/mastery/${subject}`);
    },
    getWeakTopics(subject) {
        return this.request('GET', `/api/mastery/weak/${subject}`);
    },

    // Study
    addStudyTime(subject, minutes) {
        return this.request('POST', '/api/study/time', { subject, minutes });
    },
    getStudyStats() { return this.request('GET', '/api/study/stats'); },

    // Tutor
    addTutorMessage(role, content) {
        return this.request('POST', '/api/tutor/messages', { role, content });
    },
    getTutorHistory() { return this.request('GET', '/api/tutor/messages'); },

    // Predictions
    getMemoryDecayAlerts() { return this.request('GET', '/api/predictions/memory-decay'); },
    getExamPredictions(subject) { return this.request('GET', `/api/predictions/exam/${subject}`); },

    // Bookmarks
    addBookmark(itemId, itemType, data) {
        return this.request('POST', '/api/bookmarks', { itemId, itemType, data });
    },
    getBookmarks() { return this.request('GET', '/api/bookmarks'); },
    removeBookmark(id) { return this.request('DELETE', `/api/bookmarks/${id}`); },

    // Config
    setBaseUrl(url) {
        localStorage.setItem('api_base', url);
        location.reload();
    }
};

// Migration helper: sync localStorage data to backend
async function syncLocalDataToBackend() {
    if (!API_BASE || !ApiClient.token) return;
    const user = JSON.parse(localStorage.getItem('learnai_user') || '{}');
    if (!user.id) return;

    // Sync quiz results
    const progress = user.progress || {};
    Object.entries(progress).forEach(([subject, p]) => {
        (p.scores || []).forEach(s => {
            ApiClient.saveQuizResult(subject, s.score, s.total, s.topic);
        });
    });

    // Sync mistakes
    (user.mistakes || []).forEach(m => {
        ApiClient.addMistake(m.subject, m.question, m.correctAnswer, m.userAnswer, m.explanation, m.topic);
    });

    // Sync goals
    (user.goals || []).forEach(g => {
        ApiClient.addGoal(g.subject, g.targetGrade, g.deadline);
    });

    // Sync study time
    Object.entries(progress).forEach(([subject, p]) => {
        if (p.timeSpent) ApiClient.addStudyTime(subject, p.timeSpent);
    });

    // Sync tutor messages
    (user.tutorHistory || []).forEach(m => {
        ApiClient.addTutorMessage(m.role, m.content);
    });

    console.log('Local data synced to backend');
}
