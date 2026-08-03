/* ========================================
   Focus Mode
   ======================================== */

const Focus = {
    timeLeft: 25 * 60,
    totalTime: 25 * 60,
    timer: null,
    isRunning: false,
    currentSound: null,
    audioCtx: null,
    oscillators: [],

    quotes: [
        "The secret of getting ahead is getting started.",
        "Focus on being productive instead of busy.",
        "It always seems impossible until it's done.",
        "Don't watch the clock; do what it does. Keep going.",
        "Success is the sum of small efforts repeated day in and day out.",
        "The only way to do great work is to love what you do.",
        "Your future is created by what you do today, not tomorrow.",
        "Discipline is the bridge between goals and accomplishment."
    ],

    init() {
        this.loadStats();
        this.bindEvents();
        this.showRandomQuote();
        setInterval(() => this.showRandomQuote(), 60000);
    },

    bindEvents() {
        document.getElementById('focusStart').addEventListener('click', () => this.start());
        document.getElementById('focusPause').addEventListener('click', () => this.pause());
        document.getElementById('focusReset').addEventListener('click', () => this.reset());

        document.querySelectorAll('.focus-preset').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.focus-preset').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const mins = parseInt(btn.dataset.min);
                this.totalTime = mins * 60;
                this.timeLeft = this.totalTime;
                this.updateDisplay();
                const timerEl = document.getElementById('focusTimer');
                timerEl.classList.toggle('break', mins <= 10);
            });
        });

        document.querySelectorAll('.sound-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const sound = btn.dataset.sound;
                if (btn.classList.contains('active')) {
                    btn.classList.remove('active');
                    this.stopSound();
                } else {
                    document.querySelectorAll('.sound-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this.playSound(sound);
                }
            });
        });
    },

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        document.getElementById('focusStart').style.display = 'none';
        document.getElementById('focusPause').style.display = 'inline-flex';
        this.timer = setInterval(() => this.tick(), 1000);
    },

    pause() {
        this.isRunning = false;
        clearInterval(this.timer);
        document.getElementById('focusStart').style.display = 'inline-flex';
        document.getElementById('focusPause').style.display = 'none';
    },

    reset() {
        this.pause();
        const activePreset = document.querySelector('.focus-preset.active');
        const mins = activePreset ? parseInt(activePreset.dataset.min) : 25;
        this.totalTime = mins * 60;
        this.timeLeft = this.totalTime;
        this.updateDisplay();
    },

    tick() {
        this.timeLeft--;
        this.updateDisplay();
        if (this.timeLeft <= 0) {
            this.complete();
        }
    },

    updateDisplay() {
        const m = Math.floor(this.timeLeft / 60).toString().padStart(2, '0');
        const s = (this.timeLeft % 60).toString().padStart(2, '0');
        document.getElementById('focusTimer').textContent = `${m}:${s}`;
        document.title = `${m}:${s} - Focus Mode`;
    },

    complete() {
        this.pause();
        this.saveSession();
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleR0NZKrk7rNsGgxJkNTsvXwkDk+L0O+0dSQPUIjN7LRyJQ1MiMzrsnMiDUuGzOuwdyQMS4bL6q12JgxMhsnprnUjDEuGyOewdSMMUoXH5Kx1IgxThMbkqXMhDVGDxeOodCEMUYLF4qZzIAxPgMTipnIfDE6Aw+Kkch8MTf/D4aNxHgxM/8PgoHEeDEz/w9+fcB4MTf7D3Z1uHgxM/sPbnGseDEv+w9qZah4MS/7D1pZoHgxL/sPSk2YdDEr+w9CLYR0MSf7DzIVfHQxI/sPEgFodDEf+w8N+WR0MRv7DvHlXHQxF/sO2dVUdDEX+w7JzUx0MQ/7DrnJRHAxC/sOmb0wcDD7+w6BtShwMPf7Dmm1JHAs8/sOXbEYcCzv+w5VrRRwKOv7Dk2pEHAg5/sORaUMcBzj+w49pQhwHN/7DjWhBHAY2/sOJaD8cBTb+w4dnPhwENf7DhWc9HAI0/sODZjsb//+zw2U5G///sr9iMhv//7C+YDEa//+vvF4xGf//rbxbMRj//6u6WTEY//+pulcxF///prhVMRb//6O3UzEV//+gtVExFP//n7RPMRT//5yyTTEU//+XsEwxE///lrBKMRH//5OuSTEQ//+Pq0cxEP//jqhGMQ///4ymRTEP//+IpUQxD///hqNCMQ7//4SiQTEO//+DoD4xDf//gJ48MQ3//36bOzEM//98mTkxDP//fJc3MQv//3mVNjEL//93kzUxCv//dZE0MQn//3OPMjEJ//9xjTAxCP//b4svMQj//22KLjEI//9siS0xB///aocrMQf//2iFKjEH//9lgycxBv//YoMlMQX//2CDJDEF//9egSMxBP//XIAgMQP//1p9HzEC//9YfB4xAf//VnscMQD//1N6GzD//w==');
        audio.play().catch(() => {});
        alert('Focus session complete! Great work.');
        this.reset();
    },

    saveSession() {
        const mins = Math.floor(this.totalTime / 60);
        const user = Auth.getUser();
        if (user) {
            if (!user.focusStats) user.focusStats = { sessions: 0, minutes: 0, streak: 0, lastDate: null };
            user.focusStats.sessions++;
            user.focusStats.minutes += mins;
            const today = new Date().toDateString();
            if (user.focusStats.lastDate === new Date(Date.now() - 86400000).toDateString()) {
                user.focusStats.streak++;
            } else if (user.focusStats.lastDate !== today) {
                user.focusStats.streak = 1;
            }
            user.focusStats.lastDate = today;
            Auth.saveUser(user);
            Auth.addStudyTime('general', mins);
        }
        this.loadStats();
    },

    loadStats() {
        const user = Auth.getUser();
        const stats = user?.focusStats || { sessions: 0, minutes: 0, streak: 0 };
        document.getElementById('statSessions').textContent = stats.sessions;
        document.getElementById('statMinutes').textContent = stats.minutes;
        document.getElementById('statStreak').textContent = stats.streak;
    },

    showRandomQuote() {
        const quote = this.quotes[Math.floor(Math.random() * this.quotes.length)];
        document.getElementById('focusQuote').textContent = `"${quote}"`;
    },

    playSound(type) {
        this.stopSound();
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const ctx = this.audioCtx;

        if (type === 'rain') {
            this.createNoise(ctx, 0.08, 800, 'lowpass');
        } else if (type === 'fire') {
            this.createNoise(ctx, 0.12, 400, 'lowpass');
        } else if (type === 'cafe') {
            this.createNoise(ctx, 0.05, 1200, 'bandpass');
        } else if (type === 'waves') {
            this.createNoise(ctx, 0.1, 300, 'lowpass');
        }
    },

    createNoise(ctx, volume, freq, filterType) {
        const bufferSize = 2 * ctx.sampleRate;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;
        const filter = ctx.createBiquadFilter();
        filter.type = filterType;
        filter.frequency.value = freq;
        const gain = ctx.createGain();
        gain.gain.value = volume;
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start();
        this.oscillators.push(noise);
    },

    stopSound() {
        this.oscillators.forEach(o => { try { o.stop(); } catch(e) {} });
        this.oscillators = [];
        if (this.audioCtx) { try { this.audioCtx.close(); } catch(e) {} }
    }
};

document.addEventListener('DOMContentLoaded', () => Focus.init());
