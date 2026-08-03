/* ========================================
   Authentication System
   ======================================== */

// Auth State Management
const Auth = {
    // Check if user is logged in
    isLoggedIn() {
        return localStorage.getItem('learnai_user') !== null;
    },
    
    // Get current user
    getUser() {
        const user = localStorage.getItem('learnai_user');
        return user ? JSON.parse(user) : null;
    },
    
    // Check if user has Pro subscription
    isPro() {
        const user = this.getUser();
        return user && user.plan === 'pro';
    },
    
    // Login user
    login(email, password) {
        // In a real app, this would call an API
        // For demo, we'll check against registered users
        const users = JSON.parse(localStorage.getItem('learnai_users') || '[]');
        const user = users.find(u => u.email === email);
        
        if (!user) {
            return { success: false, error: 'Account not found. Please sign up first.' };
        }
        
        if (user.password !== password) {
            return { success: false, error: 'Incorrect password.' };
        }
        
        // Set session
        localStorage.setItem('learnai_user', JSON.stringify(user));
        return { success: true, user };
    },
    
    // Register user
    register(userData) {
        const users = JSON.parse(localStorage.getItem('learnai_users') || '[]');
        
        // Check if email exists
        if (users.find(u => u.email === userData.email)) {
            return { success: false, error: 'An account with this email already exists.' };
        }
        
        // Create user
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
            achievements: []
        };
        
        users.push(newUser);
        localStorage.setItem('learnai_users', JSON.stringify(users));
        localStorage.setItem('learnai_user', JSON.stringify(newUser));
        
        return { success: true, user: newUser };
    },
    
    // Logout
    logout() {
        localStorage.removeItem('learnai_user');
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
        this.saveUser(user);
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
    },

    // Get tutor history
    getTutorHistory() {
        const user = this.getUser();
        return user && user.tutorHistory ? user.tutorHistory : [];
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
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const btn = document.getElementById('loginBtn');
            
            btn.classList.add('btn-loading');
            btn.disabled = true;
            
            setTimeout(() => {
                const result = Auth.login(email, password);
                
                if (result.success) {
                    window.location.href = 'dashboard.html';
                } else {
                    showAlert(result.error, 'error');
                    btn.classList.remove('btn-loading');
                    btn.disabled = false;
                }
            }, 800);
        });
    }
    
    // Handle Register Form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
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
            
            setTimeout(() => {
                const result = Auth.register(userData);
                
                if (result.success) {
                    showAlert('Account created successfully! Redirecting...', 'success');
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1000);
                } else {
                    showAlert(result.error, 'error');
                    btn.classList.remove('btn-loading');
                    btn.disabled = false;
                }
            }, 800);
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
