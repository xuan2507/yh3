/* ========================================
   LearnAI - Interactive Scripts
   ======================================== */

document.addEventListener('DOMContentLoaded', function() {
    
    // ========================================
    // Navbar Scroll Effect
    // ========================================
    const navbar = document.getElementById('navbar');
    
    function updateNavbar() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
    
    window.addEventListener('scroll', updateNavbar);
    updateNavbar();
    
    // ========================================
    // Mobile Navigation Toggle
    // ========================================
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    navToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        
        // Animate hamburger
        const spans = navToggle.querySelectorAll('span');
        if (navMenu.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });
    
    // Close menu on link click
    navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            const spans = navToggle.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        });
    });
    
    // ========================================
    // Smooth Scroll for Anchor Links
    // ========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offset = 80;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // ========================================
    // Scroll Animations (Intersection Observer)
    // ========================================
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe cards and sections
    const animateElements = document.querySelectorAll(
        '.problem-card, .feature-card, .step, .testimonial-card, .pricing-card, .demo-content, .demo-visual'
    );
    
    animateElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(el);
    });
    
    // ========================================
    // Hero Stats Counter Animation
    // ========================================
    function animateCounter(element, target, suffix = '') {
        let current = 0;
        const increment = target / 60;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            
            if (target >= 1000) {
                element.textContent = Math.floor(current / 1000) + 'K+';
            } else {
                element.textContent = Math.floor(current) + suffix;
            }
        }, 25);
    }
    
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statNumbers = entry.target.querySelectorAll('.stat-number');
                statNumbers.forEach(stat => {
                    const text = stat.textContent;
                    if (text.includes('K')) {
                        animateCounter(stat, 50000);
                    } else if (text.includes('M')) {
                        animateCounter(stat, 1000000);
                    } else if (text.includes('%')) {
                        animateCounter(stat, 95, '%');
                    }
                });
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) {
        statsObserver.observe(heroStats);
    }
    
    // ========================================
    // Flashcard Flip Demo
    // ========================================
    const flashcard = document.querySelector('.flashcard');
    if (flashcard) {
        let isFlipped = false;
        const flashcardContent = {
            front: {
                text: 'What causes demand-pull inflation?',
                hint: 'Click to reveal answer'
            },
            back: {
                text: 'Demand-pull inflation occurs when aggregate demand increases faster than an economy\'s productive capacity, causing prices to rise.',
                hint: 'Click to see question'
            }
        };
        
        flashcard.addEventListener('click', function() {
            isFlipped = !isFlipped;
            const p = this.querySelector('p');
            const hint = this.querySelector('.flashcard-hint');
            
            this.style.transform = 'rotateY(90deg)';
            
            setTimeout(() => {
                if (isFlipped) {
                    p.textContent = flashcardContent.back.text;
                    hint.textContent = flashcardContent.back.hint;
                    this.style.background = 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(6, 182, 212, 0.1))';
                    this.style.borderColor = 'rgba(34, 197, 94, 0.3)';
                } else {
                    p.textContent = flashcardContent.front.text;
                    hint.textContent = flashcardContent.front.hint;
                    this.style.background = 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(6, 182, 212, 0.1))';
                    this.style.borderColor = 'rgba(99, 102, 241, 0.2)';
                }
                this.style.transform = 'rotateY(0)';
            }, 150);
        });
    }
    
    // ========================================
    // Progress Bar Animation
    // ========================================
    const progressBars = document.querySelectorAll('.progress-fill');
    
    const progressObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bar = entry.target;
                const width = bar.style.width;
                bar.style.width = '0';
                setTimeout(() => {
                    bar.style.width = width;
                }, 200);
                progressObserver.unobserve(bar);
            }
        });
    }, { threshold: 0.5 });
    
    progressBars.forEach(bar => {
        bar.style.transition = 'width 1.5s ease';
        progressObserver.observe(bar);
    });
    
    // ========================================
    // Form Submission
    // ========================================
    const signupForm = document.getElementById('signupForm');
    
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            const btn = this.querySelector('button');
            const originalText = btn.innerHTML;
            
            // Simulate submission
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            btn.disabled = true;
            
            setTimeout(() => {
                btn.innerHTML = '<i class="fas fa-check"></i> You\'re on the waitlist!';
                btn.style.background = 'var(--success)';
                
                // Show success message
                const note = document.querySelector('.cta-note');
                note.innerHTML = '<i class="fas fa-envelope"></i> Check your email for confirmation!';
                note.style.color = 'var(--success)';
                
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.background = '';
                    btn.disabled = false;
                    this.reset();
                    note.innerHTML = '<i class="fas fa-shield-alt"></i> No credit card required. Cancel anytime.';
                    note.style.color = '';
                }, 3000);
            }, 1500);
        });
    }
    
    // ========================================
    // Parallax Effect for Hero
    // ========================================
    let ticking = false;
    
    function updateParallax() {
        const scrolled = window.pageYOffset;
        const heroBg = document.querySelector('.hero-bg');
        const floatingCards = document.querySelectorAll('.floating-card');
        
        if (heroBg && scrolled < window.innerHeight) {
            heroBg.style.transform = `translateY(${scrolled * 0.3}px)`;
        }
        
        floatingCards.forEach((card, index) => {
            if (scrolled < window.innerHeight) {
                const speed = 0.1 + (index * 0.05);
                card.style.transform = `translateY(${scrolled * speed}px)`;
            }
        });
        
        ticking = false;
    }
    
    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(updateParallax);
            ticking = true;
        }
    });
    
    // ========================================
    // Typing Effect for Chat Bubbles (Hero)
    // ========================================
    function typeWriter(element, text, speed = 50) {
        let i = 0;
        element.textContent = '';
        
        function type() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }
        
        type();
    }
    
    // Trigger typing effect when hero is visible
    const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const chatBubbles = entry.target.querySelectorAll('.chat-bubble p');
                if (chatBubbles.length >= 2) {
                    setTimeout(() => {
                        typeWriter(chatBubbles[1], 'I don\'t understand quadratic equations', 40);
                    }, 500);
                    setTimeout(() => {
                        typeWriter(chatBubbles[0], 'Let me explain this concept step by step...', 40);
                    }, 2500);
                }
                heroObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        heroObserver.observe(heroSection);
    }
    
    // ========================================
    // Demo Navigation Interaction
    // ========================================
    const demoNavItems = document.querySelectorAll('.demo-nav-item');
    
    demoNavItems.forEach(item => {
        item.addEventListener('click', function() {
            demoNavItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // ========================================
    // Upload Zone Interaction
    // ========================================
    const uploadZone = document.querySelector('.upload-zone');
    
    if (uploadZone) {
        uploadZone.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.style.borderColor = 'var(--primary)';
            this.style.background = 'rgba(99, 102, 241, 0.1)';
        });
        
        uploadZone.addEventListener('dragleave', function(e) {
            e.preventDefault();
            this.style.borderColor = '';
            this.style.background = '';
        });
        
        uploadZone.addEventListener('drop', function(e) {
            e.preventDefault();
            this.style.borderColor = 'var(--success)';
            this.style.background = 'rgba(34, 197, 94, 0.1)';
            this.innerHTML = '<i class="fas fa-check-circle" style="color: var(--success); font-size: 2rem;"></i><span>Files uploaded successfully!</span>';
            
            setTimeout(() => {
                this.style.borderColor = '';
                this.style.background = '';
                this.innerHTML = '<i class="fas fa-cloud-upload-alt"></i><span>Drop files or click to upload</span>';
            }, 2000);
        });
        
        uploadZone.addEventListener('click', function() {
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    }
    
    // ========================================
    // Active Navigation Link on Scroll
    // ========================================
    const sections = document.querySelectorAll('section[id]');
    
    function updateActiveLink() {
        const scrollPos = window.scrollY + 100;
        
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            
            if (scrollPos >= top && scrollPos < top + height) {
                document.querySelectorAll('.nav-menu a').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + id) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    
    window.addEventListener('scroll', updateActiveLink);
    
    // ========================================
    // Preloader (optional enhancement)
    // ========================================
    window.addEventListener('load', function() {
        document.body.style.opacity = '1';
    });
    
});

// ========================================
// Utility Functions
// ========================================

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}