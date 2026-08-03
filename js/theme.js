/* ========================================
   Dark/Light Mode Toggle
   ======================================== */

const Theme = {
    init() {
        const saved = localStorage.getItem('learnai_theme');
        if (saved) {
            document.documentElement.setAttribute('data-theme', saved);
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            document.documentElement.setAttribute('data-theme', 'light');
        }
        this.renderToggle();
    },

    toggle() {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('learnai_theme', next);
        this.updateIcon(next);
    },

    renderToggle() {
        const existing = document.getElementById('themeToggle');
        if (existing) existing.remove();

        const btn = document.createElement('button');
        btn.id = 'themeToggle';
        btn.className = 'theme-toggle';
        btn.title = 'Toggle dark/light mode';
        btn.innerHTML = '<i class="fas fa-sun"></i>';
        btn.addEventListener('click', () => this.toggle());

        const navRight = document.querySelector('.dash-nav-right') || document.querySelector('.nav-container');
        if (navRight) {
            navRight.insertBefore(btn, navRight.firstChild);
        }

        const current = document.documentElement.getAttribute('data-theme');
        this.updateIcon(current || 'dark');
    },

    updateIcon(theme) {
        const btn = document.getElementById('themeToggle');
        if (!btn) return;
        btn.innerHTML = theme === 'light'
            ? '<i class="fas fa-moon"></i>'
            : '<i class="fas fa-sun"></i>';
    }
};

document.addEventListener('DOMContentLoaded', () => Theme.init());
