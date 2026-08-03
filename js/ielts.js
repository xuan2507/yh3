/* ========================================
   IELTS Prep Page
   ======================================== */

const IeltsPrep = {
    cueCards: [
        { topic: 'Describe a skill you would like to learn in the future.', points: ['What the skill is', 'Why you want to learn it', 'How you would learn it', 'And explain how this skill would be useful to you'] },
        { topic: 'Describe a place you have visited that had a lot of noise.', points: ['Where it was', 'Why you went there', 'Why it was noisy', 'And explain how you felt about the noise'] },
        { topic: 'Describe a person who has had a significant influence on your life.', points: ['Who the person is', 'How you know them', 'What they have done for you', 'And explain why they are important to you'] },
        { topic: 'Describe a piece of technology you find useful.', points: ['What it is', 'How long you have used it', 'How you use it', 'And explain why you find it useful'] },
        { topic: 'Describe a time when you helped someone.', points: ['Who you helped', 'What you did', 'Why you helped them', 'And explain how you felt after helping'] },
        { topic: 'Describe a book you have read recently.', points: ['What the book is about', 'When you read it', 'Why you chose it', 'And explain what you learned from it'] },
        { topic: 'Describe a goal you want to achieve in the next few years.', points: ['What the goal is', 'Why you set this goal', 'What you are doing to achieve it', 'And explain why this goal is important to you'] },
        { topic: 'Describe a traditional festival or celebration in your country.', points: ['What it is', 'When it is celebrated', 'What people do', 'And explain why it is important'] }
    ],

    init() {
        if (!Auth.protectRoute()) return;
        Auth.updateUserDisplay();
        this.bindTabs();
        this.bindBandCalculator();
        this.bindCueCards();
    },

    bindTabs() {
        document.querySelectorAll('.ielts-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.ielts-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.ielts-panel').forEach(p => p.classList.remove('active'));
                tab.classList.add('active');
                document.getElementById(tab.dataset.tab + 'Panel').classList.add('active');
            });
        });
    },

    bindBandCalculator() {
        const inputs = ['bandL', 'bandR', 'bandW', 'bandS'];
        const calc = () => {
            const scores = inputs.map(id => parseFloat(document.getElementById(id).value) || 0);
            const avg = scores.reduce((a, b) => a + b, 0) / 4;
            // IELTS rounds to nearest 0.5 (0.25 rounds up, 0.75 rounds up)
            const rounded = Math.round(avg * 2) / 2;
            document.getElementById('overallBand').textContent = rounded.toFixed(1);
        };
        inputs.forEach(id => {
            document.getElementById(id).addEventListener('input', calc);
        });
        calc();
    },

    bindCueCards() {
        document.getElementById('newCueBtn').addEventListener('click', () => {
            const card = this.cueCards[Math.floor(Math.random() * this.cueCards.length)];
            const html = `
                <div class="cue-header">${card.topic}</div>
                <ul>${card.points.map(p => `<li>${p}</li>`).join('')}</ul>
            `;
            document.getElementById('cueCard').innerHTML = html;
        });
    }
};

document.addEventListener('DOMContentLoaded', () => IeltsPrep.init());
