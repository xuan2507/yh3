/* ========================================
   Study Mascot - Stich-like Avatar
   ======================================== */

const Mascot = {
    init() {
        if (document.querySelector('.study-mascot')) return;
        const mascot = document.createElement('div');
        mascot.className = 'study-mascot';
        mascot.innerHTML = `
            <div class="mascot-body">
                <svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg">
                    <!-- Ears -->
                    <ellipse cx="25" cy="35" rx="18" ry="28" fill="#3b82f6" transform="rotate(-30 25 35)"/>
                    <ellipse cx="95" cy="35" rx="18" ry="28" fill="#3b82f6" transform="rotate(30 95 35)"/>
                    <ellipse cx="25" cy="35" rx="10" ry="18" fill="#60a5fa" transform="rotate(-30 25 35)"/>
                    <ellipse cx="95" cy="35" rx="10" ry="18" fill="#60a5fa" transform="rotate(30 95 35)"/>
                    <!-- Head -->
                    <ellipse cx="60" cy="55" rx="35" ry="32" fill="#3b82f6"/>
                    <!-- Eye patches -->
                    <ellipse cx="45" cy="52" rx="14" ry="16" fill="#60a5fa" opacity="0.6"/>
                    <ellipse cx="75" cy="52" rx="14" ry="16" fill="#60a5fa" opacity="0.6"/>
                    <!-- Eyes -->
                    <ellipse cx="45" cy="52" rx="10" ry="12" fill="white"/>
                    <ellipse cx="75" cy="52" rx="10" ry="12" fill="white"/>
                    <!-- Pupils -->
                    <ellipse cx="47" cy="52" rx="5" ry="7" fill="#0f172a"/>
                    <ellipse cx="73" cy="52" rx="5" ry="7" fill="#0f172a"/>
                    <circle cx="48" cy="50" r="2" fill="white"/>
                    <circle cx="74" cy="50" r="2" fill="white"/>
                    <!-- Nose -->
                    <ellipse cx="60" cy="68" rx="10" ry="7" fill="#1e3a5f"/>
                    <ellipse cx="60" cy="66" rx="4" ry="2" fill="#60a5fa" opacity="0.5"/>
                    <!-- Mouth -->
                    <path d="M 48 78 Q 60 88 72 78" stroke="#1e3a5f" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                    <!-- Teeth -->
                    <path d="M 52 80 L 55 85 L 58 80" fill="white"/>
                    <path d="M 62 80 L 65 85 L 68 80" fill="white"/>
                    <!-- Body -->
                    <ellipse cx="60" cy="105" rx="28" ry="25" fill="#3b82f6"/>
                    <ellipse cx="60" cy="105" rx="16" ry="14" fill="#60a5fa" opacity="0.4"/>
                    <!-- Arms holding book -->
                    <ellipse cx="32" cy="95" rx="8" ry="14" fill="#3b82f6" transform="rotate(20 32 95)"/>
                    <ellipse cx="88" cy="95" rx="8" ry="14" fill="#3b82f6" transform="rotate(-20 88 95)"/>
                    <!-- Book -->
                    <rect x="38" y="92" width="24" height="18" rx="2" fill="#f59e0b"/>
                    <rect x="40" y="94" width="20" height="14" rx="1" fill="#fbbf24"/>
                    <line x1="50" y1="94" x2="50" y2="108" stroke="#d97706" stroke-width="1"/>
                    <line x1="42" y1="98" x2="48" y2="98" stroke="#d97706" stroke-width="1"/>
                    <line x1="42" y1="102" x2="48" y2="102" stroke="#d97706" stroke-width="1"/>
                    <line x1="52" y1="98" x2="58" y2="98" stroke="#d97706" stroke-width="1"/>
                    <line x1="52" y1="102" x2="58" y2="102" stroke="#d97706" stroke-width="1"/>
                    <!-- Legs -->
                    <ellipse cx="45" cy="128" rx="10" ry="8" fill="#3b82f6"/>
                    <ellipse cx="75" cy="128" rx="10" ry="8" fill="#3b82f6"/>
                    <!-- Spots -->
                    <circle cx="35" cy="100" r="3" fill="#1d4ed8" opacity="0.4"/>
                    <circle cx="85" cy="102" r="2.5" fill="#1d4ed8" opacity="0.4"/>
                    <circle cx="60" cy="118" r="2" fill="#1d4ed8" opacity="0.4"/>
                </svg>
                <div class="mascot-bubble" id="mascotBubble">Hey! Ready to study?</div>
            </div>
        `;
        document.body.appendChild(mascot);

        // Animate
        setTimeout(() => mascot.classList.add('mascot-visible'), 800);

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
            "Study smart!"
        ];

        setInterval(() => {
            const bubble = document.getElementById('mascotBubble');
            if (bubble && Math.random() > 0.7) {
                bubble.textContent = messages[Math.floor(Math.random() * messages.length)];
                bubble.classList.add('bubble-pop');
                setTimeout(() => bubble.classList.remove('bubble-pop'), 400);
            }
        }, 15000);

        // Click interaction
        mascot.addEventListener('click', () => {
            const bubble = document.getElementById('mascotBubble');
            if (bubble) {
                bubble.textContent = messages[Math.floor(Math.random() * messages.length)];
                bubble.classList.add('bubble-pop');
                setTimeout(() => bubble.classList.remove('bubble-pop'), 400);
            }
            mascot.querySelector('.mascot-body').classList.add('mascot-bounce');
            setTimeout(() => mascot.querySelector('.mascot-body').classList.remove('mascot-bounce'), 600);
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    if (!window.location.pathname.includes('login') && !window.location.pathname.includes('register')) {
        Mascot.init();
    }
});
