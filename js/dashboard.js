/* ========================================
   Dashboard Functionality
   ======================================== */

// Subject data
const SUBJECTS = [
    { id: 'physics', name: 'Physics', code: '9702/0625', icon: 'fa-atom' },
    { id: 'chemistry', name: 'Chemistry', code: '9701/0620', icon: 'fa-flask' },
    { id: 'biology', name: 'Biology', code: '9700/0610', icon: 'fa-dna' },
    { id: 'maths', name: 'Mathematics', code: '9709/0580', icon: 'fa-square-root-alt' },
    { id: 'addmaths', name: 'Add. Maths', code: '9231/0606', icon: 'fa-function' },
    { id: 'economics', name: 'Economics', code: '9708/0455', icon: 'fa-chart-line' },
    { id: 'business', name: 'Business', code: '9609/0450', icon: 'fa-briefcase' },
    { id: 'accounting', name: 'Accounting', code: '9706/0452', icon: 'fa-calculator' },
    { id: 'english', name: 'English', code: '9695/0475', icon: 'fa-book' },
    { id: 'chinese', name: 'Chinese', code: '9715/0509', icon: 'fa-language' },
    { id: 'psychology', name: 'Psychology', code: '9990/0499', icon: 'fa-brain' },
    { id: 'ielts', name: 'IELTS', code: 'IELTS', icon: 'fa-globe' }
];

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Protect route
    if (!Auth.isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }
    
    // Update user info
    Auth.updateUserDisplay();
    
    // Load subjects
    loadSubjects();
    
    // Load stats
    loadStats();
    
    // Handle resource filters
    setupResourceFilters();
    
    // Handle unlock buttons
    setupUnlockButtons();
    
    // Handle upgrade modal
    setupUpgradeModal();
    
    // Check subscription status and update UI
    updateSubscriptionUI();
});

// Load subjects into dashboard
function loadSubjects() {
    const grid = document.getElementById('dashSubjectsGrid');
    if (!grid) return;
    
    const user = Auth.getUser();
    const userSubjects = user.subjects || ['physics', 'chemistry', 'maths'];
    
    grid.innerHTML = SUBJECTS.map(subject => {
        const isActive = userSubjects.includes(subject.id);
        return `
            <div class="dash-subject-card ${isActive ? '' : 'locked'}" data-subject="${subject.id}">
                <div class="dash-subject-icon"><i class="fas ${subject.icon}"></i></div>
                <h3>${subject.name}</h3>
                <span>${subject.code}</span>
            </div>
        `;
    }).join('');
    
    // Animate cards
    const cards = grid.querySelectorAll('.dash-subject-card');
    cards.forEach((card, i) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
            card.style.transition = 'all 0.4s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, i * 50);
    });
}

// Load user stats
function loadStats() {
    const user = Auth.getUser();
    const stats = user.stats || { subjects: 0, resources: 0, hours: 0, progress: 0, quizzesTaken: 0, avgScore: 0, streak: 0 };

    // Animate counters
    animateCounter('streakCount', stats.streak || 0, '');
    animateCounter('hoursCount', stats.hours || 0, '');
    animateCounter('quizzesCount', stats.quizzesTaken || 0, '');
    animateCounter('avgScoreCount', stats.avgScore || 0, '%');
}

// Counter animation
function animateCounter(id, target, suffix) {
    const el = document.getElementById(id);
    if (!el) return;
    
    let current = 0;
    const increment = target / 40;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        
        if (suffix === '%') {
            el.textContent = Math.floor(current) + suffix;
        } else {
            el.textContent = Math.floor(current);
        }
    }, 30);
}

// Resource filters
function setupResourceFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const resourceCards = document.querySelectorAll('.resource-card');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.dataset.filter;
            
            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Filter cards
            resourceCards.forEach(card => {
                if (filter === 'all' || card.dataset.type === filter) {
                    card.style.display = '';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 50);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(10px)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
}

// Unlock buttons (for free users trying to access Pro resources)
function setupUnlockButtons() {
    const unlockBtns = document.querySelectorAll('.unlock-btn');
    
    unlockBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            if (Auth.isPro()) {
                // Already Pro - unlock the resource
                const card = this.closest('.resource-card');
                card.classList.remove('locked');
                this.innerHTML = '<i class="fas fa-download"></i> Download';
                this.classList.replace('btn-outline', 'btn-primary');
                
                // Update stats
                updateResourceStats();
            } else {
                // Show upgrade modal
                showUpgradeModal();
            }
        });
    });
}

// Upgrade modal
function setupUpgradeModal() {
    const modal = document.getElementById('upgradeModal');
    const closeBtn = document.getElementById('modalClose');
    const overlay = modal.querySelector('.modal-overlay');
    const upgradeBtn = document.getElementById('upgradeBtn');
    
    function close() {
        modal.classList.remove('active');
    }
    
    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', close);
    
    // Handle upgrade
    upgradeBtn.addEventListener('click', function() {
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        this.disabled = true;
        
        setTimeout(() => {
            Auth.upgradeToPro();
            
            // Show success
            this.innerHTML = '<i class="fas fa-check"></i> Upgraded!';
            this.style.background = 'var(--success)';
            
            setTimeout(() => {
                modal.classList.remove('active');
                window.location.reload();
            }, 1500);
        }, 1500);
    });
    
    // Sidebar CTA
    const sidebarCta = document.getElementById('sidebarCta');
    if (sidebarCta) {
        sidebarCta.querySelector('.btn').addEventListener('click', function(e) {
            e.preventDefault();
            showUpgradeModal();
        });
    }
}

function showUpgradeModal() {
    const modal = document.getElementById('upgradeModal');
    modal.classList.add('active');
}

// Update UI based on subscription
function updateSubscriptionUI() {
    const isPro = Auth.isPro();
    
    if (isPro) {
        // Unlock all resources
        const lockedCards = document.querySelectorAll('.resource-card.locked');
        lockedCards.forEach(card => {
            card.classList.remove('locked');
            const btn = card.querySelector('.unlock-btn');
            if (btn) {
                btn.innerHTML = '<i class="fas fa-download"></i> Download';
                btn.classList.replace('btn-outline', 'btn-primary');
            }
        });
        
        // Update sidebar
        const sidebarCta = document.getElementById('sidebarCta');
        if (sidebarCta) {
            sidebarCta.innerHTML = `
                <div class="sidebar-cta-content">
                    <i class="fas fa-crown"></i>
                    <p>You have Pro access</p>
                    <span style="font-size: 0.75rem; color: var(--text-muted);">All resources unlocked</span>
                </div>
            `;
        }
    }
}

// Update resource stats
function updateResourceStats() {
    const user = Auth.getUser();
    if (user && user.stats) {
        user.stats.resources += 1;
        localStorage.setItem('learnai_user', JSON.stringify(user));
        
        // Update display
        const resourcesEl = document.getElementById('resourcesCount');
        if (resourcesEl) {
            resourcesEl.textContent = user.stats.resources;
        }
    }
}

// Add subject button
const addSubjectBtn = document.getElementById('addSubjectBtn');
if (addSubjectBtn) {
    addSubjectBtn.addEventListener('click', function(e) {
        e.preventDefault();
        showAlert('Subject selection: Coming soon!', 'success');
    });
}

// Helper: Show alert (dashboard version)
function showAlert(message, type) {
    const alert = document.createElement('div');
    alert.style.cssText = `
        position: fixed;
        top: 80px;
        right: 24px;
        padding: 16px 24px;
        background: ${type === 'success' ? 'rgba(34, 197, 94, 0.9)' : 'rgba(99, 102, 241, 0.9)'};
        color: white;
        border-radius: 12px;
        font-weight: 500;
        z-index: 3000;
        animation: slideIn 0.3s ease;
    `;
    alert.textContent = message;
    
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => alert.remove(), 300);
    }, 3000);
}

// Add keyframes for alerts
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
