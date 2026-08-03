/* ========================================
   Authentication System
   ======================================== */

// Auth State Management
const Auth = {
    // Check if user is logged in
    isLoggedIn() {
        if (typeof ApiClient !== 'undefined' && ApiClient.token) return true;
        return localStorage.getItem('learnai_user') !== null;
    },

    // Get current user
    getUser() {
        if (typeof ApiClient !== 'undefined' && ApiClient.token) {
            const cached = localStorage.getItem('learnai_user');
            return cached ? JSON.parse(cached) : null;
        }
        const user = localStorage.getItem('learnai_user');
        return user ? JSON.parse(user) : null;
    },
    
    // Check if user has Pro subscription
    isPro() {
        const user = this.getUser();
        return user && user.plan === 'pro';
    },
    
    // Login user
    async login(email, password) {
        if (typeof ApiClient !== 'undefined' && localStorage.getItem('api_base')) {
            const data = await ApiClient.login(email, password);
            if (data?.token) {
                const userObj = {
                    id: data.user.id,
                    email: data.user.email,
                    firstName: data.user.firstName,
                    lastName: data.user.lastName,
                    examType: data.user.examType,
                    plan: data.user.plan,
                    stats: { subjects: 0, resources: 0, hours: 0, progress: 0, quizzesTaken: 0, avgScore: 0, streak: 0, lastStudyDate: null, totalQuestions: 0 },
                    progress: {}, bookmarks: [], studyPlan: [], tutorHistory: [], achievements: [],
                    mistakes: [], goals: [], topicMastery: {}, adaptiveLevel: {}, memoryDecay: {}
                };
                localStorage.setItem('learnai_user', JSON.stringify(userObj));
                return { success: true, user: userObj };
            }
            return { success: false, error: 'Invalid credentials' };
        }
        // Fallback localStorage
        const users = JSON.parse(localStorage.getItem('learnai_users') || '[]');
        const user = users.find(u => u.email === email);
        if (!user) return { success: false, error: 'Account not found. Please sign up first.' };
        if (user.password !== password) return { success: false, error: 'Incorrect password.' };
        localStorage.setItem('learnai_user', JSON.stringify(user));
        return { success: true, user };
    },

    // Register user
    async register(userData) {
        if (typeof ApiClient !== 'undefined' && localStorage.getItem('api_base')) {
            const data = await ApiClient.register(userData);
            if (data?.token) {
                const userObj = {
                    id: data.user.id, email: data.user.email,
                    firstName: data.user.firstName, lastName: data.user.lastName,
                    examType: data.user.examType, plan: data.user.plan,
                    stats: { subjects: 0, resources: 0, hours: 0, progress: 0, quizzesTaken: 0, avgScore: 0, streak: 0, lastStudyDate: null, totalQuestions: 0 },
                    progress: {}, bookmarks: [], studyPlan: [], tutorHistory: [], achievements: [],
                    mistakes: [], goals: [], topicMastery: {}, adaptiveLevel: {}, memoryDecay: {}
                };
                localStorage.setItem('learnai_user', JSON.stringify(userObj));
                return { success: true, user: userObj };
            }
            return { success: false, error: data?.error || 'Registration failed' };
        }
        // Fallback localStorage
        const users = JSON.parse(localStorage.getItem('learnai_users') || '[]');
        if (users.find(u => u.email === userData.email)) {
            return { success: false, error: 'An account with this email already exists.' };
        }
        const newUser = {
            id: Date.now().toString(),
            ...userData,
            plan: 'free',
            createdAt: new Date().toISOString(),
            stats: {
                subjects: 0,
                resources: 0,
                hours: 0,
                progress: 0,
                quizzesTaken: 0,
                avgScore: 0,
                streak: 0,
                lastStudyDate: null,
                totalQuestions: 0
            },
            progress: {
                physics: { completed: [], scores: [], timeSpent: 0 },
                chemistry: { completed: [], scores: [], timeSpent: 0 },
                biology: { completed: [], scores: [], timeSpent: 0 },
                maths: { completed: [], scores: [], timeSpent: 0 },
                addmaths: { completed: [], scores: [], timeSpent: 0 },
                economics: { completed: [], scores: [], timeSpent: 0 },
                business: { completed: [], scores: [], timeSpent: 0 },
                accounting: { completed: [], scores: [], timeSpent: 0 },
                english: { completed: [], scores: [], timeSpent: 0 },
                chinese: { completed: [], scores: [], timeSpent: 0 },
                psychology: { completed: [], scores: [], timeSpent: 0 },
                ielts: { completed: [], scores: [], timeSpent: 0 }
            },
            bookmarks: [],
            studyPlan: [],
            tutorHistory: [],
            achievements: [],
            mistakes: [],
            goals: [],
            topicMastery: {},
            adaptiveLevel: {},
            memoryDecay: {}
        };
        
        users.push(newUser);
        localStorage.setItem('learnai_users', JSON.stringify(users));
        localStorage.setItem('learnai_user', JSON.stringify(newUser));
        
        return { success: true, user: newUser };
    },
    
    // Logout
    logout() {
        localStorage.removeItem('learnai_user');
        localStorage.removeItem('learnai_token');
        if (typeof ApiClient !== 'undefined') ApiClient.token = null;
        window.location.href = 'index.html';
    },
    
    // Upgrade to Pro (demo)
    upgradeToPro() {
        const user = this.getUser();
        if (user) {
            user.plan = 'pro';
            localStorage.setItem('learnai_user', JSON.stringify(user));
            
            // Update in users array too
            const users = JSON.parse(localStorage.getItem('learnai_users') || '[]');
            const idx = users.findIndex(u => u.id === user.id);
            if (idx !== -1) {
                users[idx] = user;
                localStorage.setItem('learnai_users', JSON.stringify(users));
            }
            
            return true;
        }
        return false;
    },
    
    // Protect route - redirect if not logged in
    protectRoute() {
        if (!this.isLoggedIn()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    },
    
    // Save user data
    saveUser(user) {
        localStorage.setItem('learnai_user', JSON.stringify(user));
        const users = JSON.parse(localStorage.getItem('learnai_users') || '[]');
        const idx = users.findIndex(u => u.id === user.id);
        if (idx !== -1) {
            users[idx] = user;
            localStorage.setItem('learnai_users', JSON.stringify(users));
        }
    },

    // Add quiz result
    addQuizResult(subject, score, total, topic) {
        const user = this.getUser();
        if (!user) return;
        if (!user.progress) user.progress = {};
        if (!user.progress[subject]) user.progress[subject] = { completed: [], scores: [], timeSpent: 0 };
        user.progress[subject].scores.push({ score, total, topic, date: new Date().toISOString() });
        user.stats.quizzesTaken = (user.stats.quizzesTaken || 0) + 1;
        const allScores = Object.values(user.progress).flatMap(p => p.scores || []);
        if (allScores.length > 0) {
            const sum = allScores.reduce((a, s) => a + (s.score / s.total * 100), 0);
            user.stats.avgScore = Math.round(sum / allScores.length);
        }
        const pct = Math.round((score / total) * 100);
        (user.goals || []).filter(g => g.subject === subject && !g.completed).forEach(g => {
            this.updateGoalProgress(g.id, pct);
        });
        this.saveUser(user);
        if (typeof ApiClient !== 'undefined' && ApiClient.token) {
            ApiClient.saveQuizResult(subject, score, total, topic).catch(() => {});
        }
    },

    // Track topic completion
    completeTopic(subject, topic) {
        const user = this.getUser();
        if (!user) return;
        if (!user.progress[subject]) user.progress[subject] = { completed: [], scores: [], timeSpent: 0 };
        if (!user.progress[subject].completed.includes(topic)) {
            user.progress[subject].completed.push(topic);
        }
        this.saveUser(user);
    },

    // Track study time
    addStudyTime(subject, minutes) {
        const user = this.getUser();
        if (!user) return;
        if (!user.progress[subject]) user.progress[subject] = { completed: [], scores: [], timeSpent: 0 };
        user.progress[subject].timeSpent += minutes;
        user.stats.hours = Math.round((user.stats.hours || 0) + minutes / 60);
        this.saveUser(user);
        if (typeof ApiClient !== 'undefined' && ApiClient.token) {
            ApiClient.addStudyTime(subject, minutes).catch(() => {});
        }
    },

    // Update streak
    updateStreak() {
        const user = this.getUser();
        if (!user) return;
        const today = new Date().toDateString();
        const last = user.stats.lastStudyDate;
        if (last === today) return;
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (last === yesterday.toDateString()) {
            user.stats.streak = (user.stats.streak || 0) + 1;
        } else {
            user.stats.streak = 1;
        }
        user.stats.lastStudyDate = today;
        this.saveUser(user);
    },

    // Add bookmark
    addBookmark(item) {
        const user = this.getUser();
        if (!user) return;
        if (!user.bookmarks) user.bookmarks = [];
        if (!user.bookmarks.find(b => b.id === item.id)) {
            user.bookmarks.push({ ...item, addedAt: new Date().toISOString() });
            this.saveUser(user);
        }
    },

    // Remove bookmark
    removeBookmark(id) {
        const user = this.getUser();
        if (!user || !user.bookmarks) return;
        user.bookmarks = user.bookmarks.filter(b => b.id !== id);
        this.saveUser(user);
    },

    // Add tutor message to history
    addTutorMessage(role, content) {
        const user = this.getUser();
        if (!user) return;
        if (!user.tutorHistory) user.tutorHistory = [];
        user.tutorHistory.push({ role, content, time: new Date().toISOString() });
        if (user.tutorHistory.length > 100) user.tutorHistory = user.tutorHistory.slice(-100);
        this.saveUser(user);
        if (typeof ApiClient !== 'undefined' && ApiClient.token) {
            ApiClient.addTutorMessage(role, content).catch(() => {});
        }
    },

    // Get tutor history
    getTutorHistory() {
        const user = this.getUser();
        return user && user.tutorHistory ? user.tutorHistory : [];
    },

    // ========================================
    // Mistake Library
    // ========================================
    addMistake(subject, question, correctAnswer, userAnswer, explanation, topic) {
        const user = this.getUser();
        if (!user) return;
        if (!user.mistakes) user.mistakes = [];
        user.mistakes.push({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            subject,
            question,
            correctAnswer,
            userAnswer,
            explanation,
            topic: topic || 'General',
            timestamp: new Date().toISOString(),
            attempts: 1,
            mastered: false
        });
        this.saveUser(user);
        if (typeof ApiClient !== 'undefined' && ApiClient.token) {
            ApiClient.addMistake(subject, question, correctAnswer, userAnswer, explanation, topic).catch(() => {});
        }
    },

    getMistakes(subject, topic) {
        const user = this.getUser();
        if (!user || !user.mistakes) return [];
        let list = user.mistakes;
        if (subject) list = list.filter(m => m.subject === subject);
        if (topic) list = list.filter(m => m.topic === topic);
        return list.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    },

    removeMistake(id) {
        const user = this.getUser();
        if (!user || !user.mistakes) return;
        user.mistakes = user.mistakes.filter(m => m.id !== id);
        this.saveUser(user);
    },

    markMistakeMastered(id) {
        const user = this.getUser();
        if (!user || !user.mistakes) return;
        const m = user.mistakes.find(x => x.id === id);
        if (m) { m.mastered = true; this.saveUser(user); }
    },

    getMistakePatterns() {
        const user = this.getUser();
        if (!user || !user.mistakes || user.mistakes.length === 0) return [];
        const topics = {};
        user.mistakes.filter(m => !m.mastered).forEach(m => {
            topics[m.topic] = (topics[m.topic] || 0) + 1;
        });
        return Object.entries(topics).sort((a, b) => b[1] - a[1]);
    },

    generateRevisionQuiz(count = 10) {
        const mistakes = this.getMistakes().filter(m => !m.mastered);
        if (mistakes.length === 0) return [];
        const shuffled = mistakes.sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count).map(m => {
            const options = this._shuffleOptions(m.correctAnswer, m.userAnswer);
            return {
                question: m.question,
                options: options,
                correct: m.correctAnswer,
                explanation: m.explanation,
                subject: m.subject,
                topic: m.topic,
                fromMistake: true,
                mistakeId: m.id
            };
        });
    },

    _shuffleOptions(correct, wrong) {
        const opts = [correct, wrong, 'Not sure', 'Skip'];
        return opts.sort(() => Math.random() - 0.5);
    },

    // ========================================
    // Topic Mastery & Weakness Heatmap
    // ========================================
    updateTopicMastery(subject, topic, correct) {
        const user = this.getUser();
        if (!user) return;
        if (!user.topicMastery) user.topicMastery = {};
        if (!user.topicMastery[subject]) user.topicMastery[subject] = {};
        if (!user.topicMastery[subject][topic]) {
            user.topicMastery[subject][topic] = { score: 0, attempts: 0, lastSeen: null, correctStreak: 0 };
        }
        const t = user.topicMastery[subject][topic];
        t.attempts += 1;
        t.lastSeen = new Date().toISOString();
        if (correct) {
            t.correctStreak += 1;
            t.score = Math.min(100, t.score + 15);
        } else {
            t.correctStreak = 0;
            t.score = Math.max(0, t.score - 10);
        }
        if (!user.memoryDecay) user.memoryDecay = {};
        if (!user.memoryDecay[subject]) user.memoryDecay[subject] = {};
        user.memoryDecay[subject][topic] = {
            lastRevised: new Date().toISOString(),
            revisionCount: (user.memoryDecay[subject][topic]?.revisionCount || 0) + 1
        };
        this.saveUser(user);
        if (typeof ApiClient !== 'undefined' && ApiClient.token) {
            ApiClient.updateTopicMastery(subject, topic, correct).catch(() => {});
        }
    },

    getTopicMastery(subject) {
        const user = this.getUser();
        if (!user || !user.topicMastery) return {};
        return subject ? (user.topicMastery[subject] || {}) : user.topicMastery;
    },

    getWeakTopics(subject, threshold = 50) {
        const mastery = this.getTopicMastery(subject);
        const weak = [];
        Object.entries(mastery).forEach(([topic, data]) => {
            if (data.score < threshold && data.attempts >= 2) {
                weak.push({ topic, ...data });
            }
        });
        return weak.sort((a, b) => a.score - b.score);
    },

    // ========================================
    // Adaptive Difficulty
    // ========================================
    getAdaptiveLevel(subject) {
        const user = this.getUser();
        if (!user || !user.adaptiveLevel) return 1;
        return user.adaptiveLevel[subject] !== undefined ? user.adaptiveLevel[subject] : 1;
    },

    updateAdaptiveLevel(subject, correct) {
        const user = this.getUser();
        if (!user) return;
        if (!user.adaptiveLevel) user.adaptiveLevel = {};
        const current = user.adaptiveLevel[subject] !== undefined ? user.adaptiveLevel[subject] : 1;
        if (correct && current < 2) {
            const scores = (user.progress[subject]?.scores || []).slice(-5);
            const avg = scores.length ? scores.reduce((a, s) => a + (s.score / s.total), 0) / scores.length : 0;
            if (avg >= 0.8) user.adaptiveLevel[subject] = current + 1;
        } else if (!correct && current > 0) {
            user.adaptiveLevel[subject] = current - 1;
        }
        this.saveUser(user);
    },

    // ========================================
    // Memory Decay Engine
    // ========================================
    getMemoryDecayAlerts() {
        const user = this.getUser();
        if (!user || !user.memoryDecay) return [];
        const alerts = [];
        const now = new Date();
        Object.entries(user.memoryDecay).forEach(([subject, topics]) => {
            Object.entries(topics).forEach(([topic, data]) => {
                const daysSince = Math.floor((now - new Date(data.lastRevised)) / (1000 * 60 * 60 * 24));
                const decayDays = Math.max(1, 7 - (data.revisionCount || 0));
                if (daysSince >= decayDays) {
                    const mastery = user.topicMastery?.[subject]?.[topic]?.score || 0;
                    alerts.push({ subject, topic, daysSince, revisionCount: data.revisionCount, mastery, urgency: daysSince >= decayDays * 2 ? 'high' : 'medium' });
                }
            });
        });
        return alerts.sort((a, b) => b.daysSince - a.daysSince);
    },

    // ========================================
    // Exam Predictor
    // ========================================
    getExamPredictions(subject) {
        const weak = this.getWeakTopics(subject, 60);
        const mistakes = this.getMistakes(subject).filter(m => !m.mastered);
        const combined = {};
        weak.forEach(w => { combined[w.topic] = { topic: w.topic, score: w.score, source: 'weak' }; });
        mistakes.forEach(m => {
            if (combined[m.topic]) {
                combined[m.topic].source = 'both';
                combined[m.topic].score = Math.min(combined[m.topic].score, 40);
            } else {
                combined[m.topic] = { topic: m.topic, score: 40, source: 'mistake' };
            }
        });
        return Object.values(combined).sort((a, b) => a.score - b.score);
    },

    // ========================================
    // Goal Engine
    // ========================================
    addGoal(subject, targetGrade, deadline) {
        const user = this.getUser();
        if (!user) return;
        if (!user.goals) user.goals = [];
        const gradeMap = { 'A*': 95, 'A': 85, 'B': 75, 'C': 65, 'D': 55, 'E': 45 };
        const targetPct = gradeMap[targetGrade] || 80;
        const currentPct = user.stats.avgScore || 0;
        const gap = Math.max(0, targetPct - currentPct);
        const daysLeft = Math.max(1, Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24)));
        const dailyTarget = Math.ceil((gap / daysLeft) * 60);
        user.goals.push({
            id: Date.now().toString(),
            subject,
            targetGrade,
            currentGrade: this._scoreToGrade(currentPct),
            deadline,
            dailyTargetHours: Math.round(dailyTarget / 60 * 10) / 10,
            gap,
            daysLeft,
            created: new Date().toISOString(),
            completed: false
        });
        this.saveUser(user);
        if (typeof ApiClient !== 'undefined' && ApiClient.token) {
            ApiClient.addGoal(subject, targetGrade, deadline).catch(() => {});
        }
    },

    updateGoalProgress(goalId, currentScore) {
        const user = this.getUser();
        if (!user || !user.goals) return;
        const goal = user.goals.find(g => g.id === goalId);
        if (!goal) return;
        goal.currentGrade = this._scoreToGrade(currentScore);
        if (currentScore >= ({ 'A*': 95, 'A': 85, 'B': 75, 'C': 65, 'D': 55, 'E': 45 }[goal.targetGrade] || 80)) {
            goal.completed = true;
        }
        this.saveUser(user);
    },

    getGoals() {
        const user = this.getUser();
        if (!user || !user.goals) return [];
        return user.goals.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    },

    removeGoal(id) {
        const user = this.getUser();
        if (!user || !user.goals) return;
        user.goals = user.goals.filter(g => g.id !== id);
        this.saveUser(user);
    },

    _scoreToGrade(score) {
        if (score >= 95) return 'A*';
        if (score >= 85) return 'A';
        if (score >= 75) return 'B';
        if (score >= 65) return 'C';
        if (score >= 55) return 'D';
        if (score >= 45) return 'E';
        return 'U';
    },

    // Update user display
    updateUserDisplay() {
        const user = this.getUser();
        if (!user) return;
        
        // Update avatar
        const avatar = document.getElementById('userAvatar');
        if (avatar) {
            const initials = (user.firstName || 'U').charAt(0) + (user.lastName || '').charAt(0);
            avatar.textContent = initials.toUpperCase();
        }
        
        // Update name
        const nameEl = document.getElementById('userName');
        if (nameEl) {
            nameEl.textContent = user.firstName || 'Student';
        }
        
        // Update plan badge
        const planBadge = document.getElementById('planBadge');
        if (planBadge) {
            planBadge.textContent = user.plan === 'pro' ? 'Pro' : 'Free';
            planBadge.classList.toggle('pro', user.plan === 'pro');
        }
        
        // Hide upgrade CTA for Pro users
        const sidebarCta = document.getElementById('sidebarCta');
        if (sidebarCta && user.plan === 'pro') {
            sidebarCta.style.display = 'none';
        }
    }
};

// Initialize auth on page load
document.addEventListener('DOMContentLoaded', function() {
    // Handle Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const btn = document.getElementById('loginBtn');
            btn.classList.add('btn-loading');
            btn.disabled = true;
            const result = await Auth.login(email, password);
            if (result.success) {
                window.location.href = 'dashboard.html';
            } else {
                showAlert(result.error, 'error');
                btn.classList.remove('btn-loading');
                btn.disabled = false;
            }
        });
    }

    // Handle Register Form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const userData = {
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value,
                email: document.getElementById('email').value,
                examType: document.getElementById('examType').value,
                password: document.getElementById('password').value
            };
            const btn = document.getElementById('registerBtn');
            btn.classList.add('btn-loading');
            btn.disabled = true;
            const result = await Auth.register(userData);
            if (result.success) {
                showAlert('Account created successfully! Redirecting...', 'success');
                setTimeout(() => { window.location.href = 'dashboard.html'; }, 1000);
            } else {
                showAlert(result.error, 'error');
                btn.classList.remove('btn-loading');
                btn.disabled = false;
            }
        });
    }
    
    // Toggle password visibility
    const toggleBtns = document.querySelectorAll('.toggle-password');
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const icon = this.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.replace('fa-eye', 'fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.replace('fa-eye-slash', 'fa-eye');
            }
        });
    });
    
    // Google Sign In/Up (demo)
    const googleBtns = document.querySelectorAll('#googleSignIn, #googleSignUp');
    googleBtns.forEach(btn => {
        if (btn) {
            btn.addEventListener('click', function() {
                showAlert('Google sign-in demo: Use email/password instead', 'error');
            });
        }
    });
    
    // Logout
    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            Auth.logout();
        });
    }
    
    // User dropdown toggle
    const userAvatar = document.getElementById('userAvatar');
    const userDropdown = document.getElementById('userDropdown');
    
    if (userAvatar && userDropdown) {
        userAvatar.addEventListener('click', function(e) {
            e.stopPropagation();
            userDropdown.classList.toggle('active');
        });
        
        document.addEventListener('click', function() {
            userDropdown.classList.remove('active');
        });
    }
    
    // Update user display on dashboard
    if (document.body.classList.contains('dashboard-page')) {
        Auth.updateUserDisplay();
    }
});

// Helper: Show alert
function showAlert(message, type) {
    // Remove existing alerts
    const existing = document.querySelector('.auth-alert');
    if (existing) existing.remove();
    
    const alert = document.createElement('div');
    alert.className = `auth-alert ${type}`;
    alert.textContent = message;
    
    const form = document.querySelector('.auth-form');
    if (form) {
        form.parentNode.insertBefore(alert, form);
    }
    
    // Auto remove after 5s
    setTimeout(() => {
        alert.remove();
    }, 5000);
}
