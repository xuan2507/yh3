const Auth = {
    isLoggedIn() {
        if (typeof ApiClient !== 'undefined' && ApiClient.token) return true;
        return localStorage.getItem('learnai_user') !== null;
    },
    getUser() {
        if (typeof ApiClient !== 'undefined' && ApiClient.token) {
            const cached = localStorage.getItem('learnai_user');
            return cached ? JSON.parse(cached) : null;
        }
        const user = localStorage.getItem('learnai_user');
        return user ? JSON.parse(user) : null;
    },
    isPro() {
        const user = this.getUser();
        return user && user.plan === 'pro';
    },
    async login(email, password) {
        if (typeof ApiClient !== 'undefined' && localStorage.getItem('api_base')) {
            const data = await ApiClient.login(email, password);
            if (data?.token) {
                const userObj = {
                    id: data.user.id, email: data.user.email,
                    firstName: data.user.firstName, lastName: data.user.lastName,
                    examType: data.user.examType, plan: data.user.plan,
                    stats: { subjects:0, resources:0, hours:0, progress:0, quizzesTaken:0, avgScore:0, streak:0, lastStudyDate:null, totalQuestions:0 },
                    progress:{}, bookmarks:[], studyPlan:[], tutorHistory:[], achievements:[],
                    mistakes:[], goals:[], topicMastery:{}, adaptiveLevel:{}, memoryDecay:{}
                };
                localStorage.setItem('learnai_user', JSON.stringify(userObj));
                return { success: true, user: userObj };
            }
            return { success: false, error: 'Invalid credentials' };
        }
        const users = JSON.parse(localStorage.getItem('learnai_users') || '[]');
        const user = users.find(u => u.email === email);
        if (!user) return { success: false, error: 'Account not found. Please sign up first.' };
        if (user._pwHash !== this._hashPw(password)) return { success: false, error: 'Incorrect password.' };
        const { password:_, _pwHash, ...safeUser } = user;
        localStorage.setItem('learnai_user', JSON.stringify(safeUser));
        return { success: true, user: safeUser };
    },
    async register(userData) {
        if (typeof ApiClient !== 'undefined' && localStorage.getItem('api_base')) {
            const data = await ApiClient.register(userData);
            if (data?.token) {
                const userObj = {
                    id: data.user.id, email: data.user.email,
                    firstName: data.user.firstName, lastName: data.user.lastName,
                    examType: data.user.examType, plan: data.user.plan,
                    stats: { subjects:0, resources:0, hours:0, progress:0, quizzesTaken:0, avgScore:0, streak:0, lastStudyDate:null, totalQuestions:0 },
                    progress:{}, bookmarks:[], studyPlan:[], tutorHistory:[], achievements:[],
                    mistakes:[], goals:[], topicMastery:{}, adaptiveLevel:{}, memoryDecay:{}
                };
                localStorage.setItem('learnai_user', JSON.stringify(userObj));
                return { success: true, user: userObj };
            }
            return { success: false, error: data?.error || 'Registration failed' };
        }
        const users = JSON.parse(localStorage.getItem('learnai_users') || '[]');
        if (users.find(u => u.email === userData.email)) {
            return { success: false, error: 'An account with this email already exists.' };
        }
        const newUser = {
            id: Date.now().toString(),
            email: userData.email, firstName: userData.firstName, lastName: userData.lastName,
            examType: userData.examType, plan: 'free', createdAt: new Date().toISOString(),
            _pwHash: this._hashPw(userData.password),
            stats: { subjects:0, resources:0, hours:0, progress:0, quizzesTaken:0, avgScore:0, streak:0, lastStudyDate:null, totalQuestions:0 },
            progress: {
                physics:{completed:[],scores:[],timeSpent:0}, chemistry:{completed:[],scores:[],timeSpent:0},
                biology:{completed:[],scores:[],timeSpent:0}, maths:{completed:[],scores:[],timeSpent:0},
                addmaths:{completed:[],scores:[],timeSpent:0}, economics:{completed:[],scores:[],timeSpent:0},
                business:{completed:[],scores:[],timeSpent:0}, accounting:{completed:[],scores:[],timeSpent:0},
                english:{completed:[],scores:[],timeSpent:0}, chinese:{completed:[],scores:[],timeSpent:0},
                psychology:{completed:[],scores:[],timeSpent:0}, ielts:{completed:[],scores:[],timeSpent:0}
            },
            bookmarks:[], studyPlan:[], tutorHistory:[], achievements:[],
            mistakes:[], goals:[], topicMastery:{}, adaptiveLevel:{}, memoryDecay:{}
        };
        users.push(newUser);
        localStorage.setItem('learnai_users', JSON.stringify(users));
        const { _pwHash, ...safeUser } = newUser;
        localStorage.setItem('learnai_user', JSON.stringify(safeUser));
        return { success: true, user: safeUser };
    },
    _hashPw(pw) {
        let h = 0;
        for (let i = 0; i < pw.length; i++) { h = ((h << 5) - h) + pw.charCodeAt(i); h |= 0; }
        return 'hash_' + Math.abs(h).toString(16);
    },
    logout() {
        localStorage.removeItem('learnai_user');
        localStorage.removeItem('learnai_token');
        if (typeof ApiClient !== 'undefined') ApiClient.token = null;
        window.location.href = 'index.html';
    },
    upgradeToPro() {
        const user = this.getUser();
        if (user) {
            user.plan = 'pro';
            localStorage.setItem('learnai_user', JSON.stringify(user));
            const users = JSON.parse(localStorage.getItem('learnai_users') || '[]');
            const idx = users.findIndex(u => u.id === user.id);
            if (idx !== -1) { users[idx].plan = 'pro'; localStorage.setItem('learnai_users', JSON.stringify(users)); }
            return true;
        }
        return false;
    },
    protectRoute() {
        if (!this.isLoggedIn()) { window.location.href = 'login.html'; return false; }
        return true;
    },
    saveUser(user) {
        localStorage.setItem('learnai_user', JSON.stringify(user));
        const users = JSON.parse(localStorage.getItem('learnai_users') || '[]');
        const idx = users.findIndex(u => u.id === user.id);
        if (idx !== -1) { users[idx] = { ...users[idx], ...user }; localStorage.setItem('learnai_users', JSON.stringify(users)); }
    },
    addQuizResult(subject, score, total, topic) {
        const user = this.getUser(); if (!user) return;
        if (!user.progress) user.progress = {};
        if (!user.progress[subject]) user.progress[subject] = { completed:[], scores:[], timeSpent:0 };
        user.progress[subject].scores.push({ score, total, topic, date: new Date().toISOString() });
        user.stats.quizzesTaken = (user.stats.quizzesTaken || 0) + 1;
        const allScores = Object.values(user.progress).flatMap(p => p.scores || []);
        if (allScores.length > 0) { const sum = allScores.reduce((a,s) => a+(s.score/s.total*100),0); user.stats.avgScore = Math.round(sum/allScores.length); }
        const pct = Math.round((score/total)*100);
        (user.goals || []).filter(g => g.subject === subject && !g.completed).forEach(g => { this.updateGoalProgress(g.id, pct); });
        this.saveUser(user);
        if (typeof ApiClient !== 'undefined' && ApiClient.token) { ApiClient.saveQuizResult(subject, score, total, topic).catch(()=>{}); }
    },
    completeTopic(subject, topic) {
        const user = this.getUser(); if (!user) return;
        if (!user.progress[subject]) user.progress[subject] = { completed:[], scores:[], timeSpent:0 };
        if (!user.progress[subject].completed.includes(topic)) user.progress[subject].completed.push(topic);
        this.saveUser(user);
    },
    addStudyTime(subject, minutes) {
        const user = this.getUser(); if (!user) return;
        if (!user.progress[subject]) user.progress[subject] = { completed:[], scores:[], timeSpent:0 };
        user.progress[subject].timeSpent += minutes;
        user.stats.hours = Math.round((user.stats.hours || 0) + minutes/60);
        this.saveUser(user);
        if (typeof ApiClient !== 'undefined' && ApiClient.token) { ApiClient.addStudyTime(subject, minutes).catch(()=>{}); }
    },
    updateStreak() {
        const user = this.getUser(); if (!user) return;
        const today = new Date().toDateString(); const last = user.stats.lastStudyDate;
        if (last === today) return;
        const yesterday = new Date(); yesterday.setDate(yesterday.getDate()-1);
        if (last === yesterday.toDateString()) user.stats.streak = (user.stats.streak || 0) + 1;
        else user.stats.streak = 1;
        user.stats.lastStudyDate = today; this.saveUser(user);
    },
    addBookmark(item) {
        const user = this.getUser(); if (!user) return;
        if (!user.bookmarks) user.bookmarks = [];
        if (!user.bookmarks.find(b => b.id === item.id)) { user.bookmarks.push({ ...item, addedAt: new Date().toISOString() }); this.saveUser(user); }
    },
    removeBookmark(id) {
        const user = this.getUser(); if (!user || !user.bookmarks) return;
        user.bookmarks = user.bookmarks.filter(b => b.id !== id); this.saveUser(user);
    },
    addTutorMessage(role, content) {
        const user = this.getUser(); if (!user) return;
        if (!user.tutorHistory) user.tutorHistory = [];
        user.tutorHistory.push({ role, content, time: new Date().toISOString() });
        if (user.tutorHistory.length > 100) user.tutorHistory = user.tutorHistory.slice(-100);
        this.saveUser(user);
        if (typeof ApiClient !== 'undefined' && ApiClient.token) { ApiClient.addTutorMessage(role, content).catch(()=>{}); }
    },
    getTutorHistory() { const user = this.getUser(); return user && user.tutorHistory ? user.tutorHistory : []; },
    addMistake(subject, question, correctAnswer, userAnswer, explanation, topic) {
        const user = this.getUser(); if (!user) return;
        if (!user.mistakes) user.mistakes = [];
        user.mistakes.push({ id: Date.now().toString()+Math.random().toString(36).substr(2,5), subject, question, correctAnswer, userAnswer, explanation, topic: topic||'General', timestamp: new Date().toISOString(), attempts:1, mastered:false });
        this.saveUser(user);
        if (typeof ApiClient !== 'undefined' && ApiClient.token) { ApiClient.addMistake(subject, question, correctAnswer, userAnswer, explanation, topic).catch(()=>{}); }
    },
    getMistakes(subject, topic) {
        const user = this.getUser(); if (!user || !user.mistakes) return [];
        let list = user.mistakes; if (subject) list = list.filter(m => m.subject === subject); if (topic) list = list.filter(m => m.topic === topic);
        return list.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
    },
    removeMistake(id) { const user = this.getUser(); if (!user || !user.mistakes) return; user.mistakes = user.mistakes.filter(m => m.id !== id); this.saveUser(user); },
    markMistakeMastered(id) { const user = this.getUser(); if (!user || !user.mistakes) return; const m = user.mistakes.find(x => x.id === id); if (m) { m.mastered = true; this.saveUser(user); } },
    getMistakePatterns() {
        const user = this.getUser(); if (!user || !user.mistakes || user.mistakes.length === 0) return [];
        const topics = {}; user.mistakes.filter(m => !m.mastered).forEach(m => { topics[m.topic] = (topics[m.topic] || 0) + 1; });
        return Object.entries(topics).sort((a,b) => b[1] - a[1]);
    },
    generateRevisionQuiz(count=10) {
        const mistakes = this.getMistakes().filter(m => !m.mastered); if (mistakes.length === 0) return [];
        const shuffled = mistakes.sort(() => Math.random()-0.5);
        return shuffled.slice(0, count).map(m => ({ question: m.question, options: this._shuffleOptions(m.correctAnswer, m.userAnswer), correct: m.correctAnswer, explanation: m.explanation, subject: m.subject, topic: m.topic, fromMistake: true, mistakeId: m.id }));
    },
    _shuffleOptions(correct, wrong) { const opts = [correct, wrong, 'Option C', 'Option D']; return opts.sort(() => Math.random()-0.5); },
    updateGoalProgress(goalId, currentScore) {
        const user = this.getUser(); if (!user || !user.goals) return;
        const goal = user.goals.find(g => g.id === goalId); if (!goal) return;
        goal.currentScore = currentScore; if (currentScore >= goal.targetScore) { goal.completed = true; goal.completedAt = new Date().toISOString(); }
        this.saveUser(user);
    },
    addAchievement(id, title, description, icon) {
        const user = this.getUser(); if (!user) return;
        if (!user.achievements) user.achievements = [];
        if (!user.achievements.find(a => a.id === id)) { user.achievements.push({ id, title, description, icon, earnedAt: new Date().toISOString() }); this.saveUser(user); }
    }
};
