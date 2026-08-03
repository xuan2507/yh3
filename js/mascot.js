/* ========================================
   Study Mascot - Cute Stitch-like Avatar
   ======================================== */

const Mascot = {
    init() {
        if (document.querySelector('.study-mascot')) return;
        const mascot = document.createElement('div');
        mascot.className = 'study-mascot';
        mascot.innerHTML = `
            <div class="mascot-body">
                <svg viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#5B8DEE"/>
                            <stop offset="50%" style="stop-color:#4A7DE4"/>
                            <stop offset="100%" style="stop-color:#3D6FD6"/>
                        </linearGradient>
                        <linearGradient id="earGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#6B9CF0"/>
                            <stop offset="100%" style="stop-color:#4A7DE4"/>
                        </linearGradient>
                        <linearGradient id="bellyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#A8C8FA"/>
                            <stop offset="100%" style="stop-color:#8BB8F7"/>
                        </linearGradient>
                        <radialGradient id="eyeGrad" cx="30%" cy="30%" r="70%">
                            <stop offset="0%" style="stop-color:#4A3000"/>
                            <stop offset="100%" style="stop-color:#1A1000"/>
                        </radialGradient>
                        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#3D6FD6" flood-opacity="0.3"/>
                        </filter>
                    </defs>
                    
                    <!-- Left Ear -->
                    <ellipse cx="35" cy="55" rx="32" ry="55" fill="url(#earGrad)" transform="rotate(-35 35 55)"/>
                    <ellipse cx="32" cy="52" rx="20" ry="38" fill="#7DABF5" transform="rotate(-35 32 52)" opacity="0.6"/>
                    <ellipse cx="28" cy="48" rx="8" ry="15" fill="#E8A4C8" transform="rotate(-35 28 48)" opacity="0.5"/>
                    
                    <!-- Right Ear -->
                    <ellipse cx="165" cy="55" rx="32" ry="55" fill="url(#earGrad)" transform="rotate(35 165 55)"/>
                    <ellipse cx="168" cy="52" rx="20" ry="38" fill="#7DABF5" transform="rotate(35 168 52)" opacity="0.6"/>
                    <ellipse cx="172" cy="48" rx="8" ry="15" fill="#E8A4C8" transform="rotate(35 172 48)" opacity="0.5"/>
                    
                    <!-- Notches in ears -->
                    <circle cx="18" cy="30" r="6" fill="var(--bg, #0a0e27)"/>
                    <circle cx="182" cy="30" r="6" fill="var(--bg, #0a0e27)"/>
                    
                    <!-- Head -->
                    <ellipse cx="100" cy="95" rx="58" ry="52" fill="url(#bodyGrad)" filter="url(#shadow)"/>
                    
                    <!-- Eye patches (lighter blue) -->
                    <ellipse cx="68" cy="88" rx="22" ry="26" fill="#7DABF5" opacity="0.5"/>
                    <ellipse cx="132" cy="88" rx="22" ry="26" fill="#7DABF5" opacity="0.5"/>
                    
                    <!-- Left Eye -->
                    <ellipse cx="70" cy="90" rx="18" ry="22" fill="white"/>
                    <ellipse cx="74" cy="88" rx="12" ry="15" fill="url(#eyeGrad)"/>
                    <circle cx="78" cy="84" r="5" fill="white" opacity="0.9"/>
                    <circle cx="72" cy="92" r="2.5" fill="white" opacity="0.6"/>
                    
                    <!-- Right Eye -->
                    <ellipse cx="130" cy="90" rx="18" ry="22" fill="white"/>
                    <ellipse cx="126" cy="88" rx="12" ry="15" fill="url(#eyeGrad)"/>
                    <circle cx="130" cy="84" r="5" fill="white" opacity="0.9"/>
                    <circle cx="124" cy="92" r="2.5" fill="white" opacity="0.6"/>
                    
                    <!-- Nose -->
                    <ellipse cx="100" cy="118" rx="16" ry="12" fill="#2A4A8C"/>
                    <ellipse cx="100" cy="115" rx="10" ry="6" fill="#4A7DE4" opacity="0.6"/>
                    
                    <!-- Mouth -->
                    <path d="M 72 132 Q 100 152 128 132" stroke="#2A4A8C" stroke-width="3.5" fill="none" stroke-linecap="round"/>
                    
                    <!-- Small teeth -->
                    <path d="M 85 138 L 89 145 L 93 138" fill="white"/>
                    <path d="M 107 138 L 111 145 L 115 138" fill="white"/>
                    
                    <!-- Cheek blush -->
                    <ellipse cx="50" cy="108" rx="10" ry="7" fill="#E8A4C8" opacity="0.35"/>
                    <ellipse cx="150" cy="108" rx="10" ry="7" fill="#E8A4C8" opacity="0.35"/>
                    
                    <!-- Body -->
                    <ellipse cx="100" cy="178" rx="48" ry="42" fill="url(#bodyGrad)"/>
                    
                    <!-- Belly patch -->
                    <ellipse cx="100" cy="182" rx="28" ry="24" fill="url(#bellyGrad)"/>
                    
                    <!-- Body spots -->
                    <ellipse cx="62" cy="170" rx="5" ry="4" fill="#2A5AB8" opacity="0.4"/>
                    <ellipse cx="140" cy="175" rx="4" ry="3.5" fill="#2A5AB8" opacity="0.4"/>
                    <ellipse cx="100" cy="200" rx="3" ry="2.5" fill="#2A5AB8" opacity="0.4"/>
                    
                    <!-- Book being held -->
                    <rect x="62" y="158" width="76" height="52" rx="6" fill="#F59E0B" transform="rotate(-5 100 184)"/>
                    <rect x="66" y="162" width="68" height="44" rx="4" fill="#FBBF24" transform="rotate(-5 100 184)"/>
                    <!-- Book spine/crease -->
                    <line x1="100" y1="162" x2="100" y2="206" stroke="#D97706" stroke-width="1.5" transform="rotate(-5 100 184)"/>
                    <!-- Book lines -->
                    <line x1="72" y1="172" x2="96" y2="170" stroke="#D97706" stroke-width="1.5" transform="rotate(-5 100 184)"/>
                    <line x1="72" y1="180" x2="96" y2="178" stroke="#D97706" stroke-width="1.5" transform="rotate(-5 100 184)"/>
                    <line x1="72" y1="188" x2="96" y2="186" stroke="#D97706" stroke-width="1.5" transform="rotate(-5 100 184)"/>
                    <line x1="104" y1="169" x2="128" y2="167" stroke="#D97706" stroke-width="1.5" transform="rotate(-5 100 184)"/>
                    <line x1="104" y1="177" x2="128" y2="175" stroke="#D97706" stroke-width="1.5" transform="rotate(-5 100 184)"/>
                    <line x1="104" y1="185" x2="128" y2="183" stroke="#D97706" stroke-width="1.5" transform="rotate(-5 100 184)"/>
                    
                    <!-- Left arm holding book -->
                    <ellipse cx="55" cy="168" rx="14" ry="22" fill="url(#bodyGrad)" transform="rotate(25 55 168)"/>
                    
                    <!-- Right arm holding book -->
                    <ellipse cx="145" cy="168" rx="14" ry="22" fill="url(#bodyGrad)" transform="rotate(-25 145 168)"/>
                    
                    <!-- Feet -->
                    <ellipse cx="72" cy="215" rx="18" ry="14" fill="url(#bodyGrad)"/>
                    <ellipse cx="128" cy="215" rx="18" ry="14" fill="url(#bodyGrad)"/>
                    <!-- Paw pads -->
                    <ellipse cx="72" cy="218" rx="8" ry="6" fill="#E8A4C8" opacity="0.5"/>
                    <ellipse cx="128" cy="218" rx="8" ry="6" fill="#E8A4C8" opacity="0.5"/>
                    
                    <!-- Tuft of hair on head -->
                    <path d="M 95 45 Q 100 30 105 42 Q 108 35 112 45" stroke="#4A7DE4" stroke-width="3" fill="none" stroke-linecap="round"/>
                </svg>
                <div class="mascot-bubble" id="mascotBubble">Hey! Ready to study?</div>
            </div>
        `;
        document.body.appendChild(mascot);

        // Animate entrance
        setTimeout(() => mascot.classList.add('mascot-visible'), 600);

        // Random encouragement messages
        const messages = [
            "You've got this!",
            "Keep going!",
            "Stay focused!",
            "Almost there!",
            "Great work!",
            "Believe in yourself!",
            "One step at a time!",
            "You're doing amazing!",
            "Don't give up!",
            "Study smart!",
            "You're a star!",
            "So proud of you!",
            "Keep pushing!",
            "You can do it!",
            "Stay curious!"
        ];

        setInterval(() => {
            const bubble = document.getElementById('mascotBubble');
            if (bubble && Math.random() > 0.65) {
                bubble.textContent = messages[Math.floor(Math.random() * messages.length)];
                bubble.classList.add('bubble-pop');
                setTimeout(() => bubble.classList.remove('bubble-pop'), 500);
            }
        }, 12000);

        // Click interaction
        mascot.addEventListener('click', () => {
            const bubble = document.getElementById('mascotBubble');
            if (bubble) {
                bubble.textContent = messages[Math.floor(Math.random() * messages.length)];
                bubble.classList.add('bubble-pop');
                setTimeout(() => bubble.classList.remove('bubble-pop'), 500);
            }
            const body = mascot.querySelector('.mascot-body');
            body.classList.add('mascot-bounce');
            setTimeout(() => body.classList.remove('mascot-bounce'), 700);
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    if (!window.location.pathname.includes('login') && !window.location.pathname.includes('register')) {
        Mascot.init();
    }
});
