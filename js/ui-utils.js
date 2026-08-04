/**
 * LearnAI UI Utilities
 * Toast notifications, scroll progress, back-to-top, counter animations
 */

const UI = {
    // Toast notifications
    toast(message, type = 'info', duration = 4000) {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const icons = {
            success: 'fa-check-circle',
            error: 'fa-times-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas ${icons[type]} toast-icon" aria-hidden="true"></i>
            <span class="toast-message">${message}</span>
            <button class="toast-close" aria-label="Dismiss notification"><i class="fas fa-times"></i></button>
        `;

        toast.querySelector('.toast-close').addEventListener('click', () => this.dismissToast(toast));
        container.appendChild(toast);

        if (duration > 0) {
            setTimeout(() => this.dismissToast(toast), duration);
        }
    },

    dismissToast(toast) {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 300);
    },

    // Scroll progress bar
    initScrollProgress() {
        const bar = document.getElementById('scrollProgress');
        if (!bar) return;
        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            bar.style.width = progress + '%';
        }, { passive: true });
    },

    // Back to top button
    initBackToTop() {
        const btn = document.getElementById('backToTop');
        if (!btn) return;
        window.addEventListener('scroll', () => {
            btn.classList.toggle('visible', window.scrollY > 500);
        }, { passive: true });
        btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    },

    // Animated counters
    initCounters() {
        const counters = document.querySelectorAll('[data-count]');
        if (!counters.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(counter => observer.observe(counter));
    },

    animateCounter(el) {
        const target = parseInt(el.dataset.count, 10);
        const duration = 2000;
        const start = performance.now();
        const format = target >= 1000000 ? (n) => (n / 1000000).toFixed(0) + 'M' :
                       target >= 1000 ? (n) => (n / 1000).toFixed(0) + 'K' :
                       (n) => n.toString();

        const tick = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(easeOut * target);
            el.textContent = format(current);
            if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    },

    // Scroll reveal animations
    initScrollReveal() {
        const elements = document.querySelectorAll('[data-animate]');
        if (!elements.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        elements.forEach(el => observer.observe(el));
    },

    // Button ripple effect
    initRipple() {
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn');
            if (!btn) return;
            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            const rect = btn.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
            ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
            btn.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
    },

    // Password strength meter
    initPasswordStrength(inputId, meterId, textId) {
        const input = document.getElementById(inputId);
        const meter = document.getElementById(meterId);
        const text = document.getElementById(textId);
        if (!input || !meter || !text) return;

        input.addEventListener('input', () => {
            const val = input.value;
            let score = 0;
            if (val.length >= 8) score++;
            if (/[A-Z]/.test(val)) score++;
            if (/[a-z]/.test(val)) score++;
            if (/[0-9]/.test(val)) score++;
            if (/[^A-Za-z0-9]/.test(val)) score++;

            const classes = ['weak', 'weak', 'fair', 'good', 'strong', 'strong'];
            const labels = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very strong'];
            const cls = classes[score];
            const label = labels[score];

            meter.className = 'strength-bar-fill ' + cls;
            text.className = 'strength-text ' + cls;
            text.textContent = val.length > 0 ? label : '';
        });
    },

    // Form loading state
    setLoading(form, loading = true) {
        const btn = form.querySelector('button[type="submit"]');
        if (!btn) return;
        btn.classList.toggle('loading', loading);
        btn.disabled = loading;
        form.querySelectorAll('input, select, textarea').forEach(el => {
            el.disabled = loading;
        });
    },

    // Initialize all
    init() {
        this.initScrollProgress();
        this.initBackToTop();
        this.initCounters();
        this.initScrollReveal();
        this.initRipple();
    }
};

// Auto-init when DOM is ready
document.addEventListener('DOMContentLoaded', () => UI.init());
