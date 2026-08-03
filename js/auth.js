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
                progress: 0
            }
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
