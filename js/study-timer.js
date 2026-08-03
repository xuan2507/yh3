/* ========================================
   Pomodoro Study Timer
   ======================================== */

const StudyTimer = {
    timeLeft: 25 * 60,
    isRunning: false,
    isBreak: false,
    timerId: null,
    sessions: 0,

    init() {
        const container = document.getElementById('studyTimerWidget');
        if (!container) return;

        container.innerHTML = `
            <div class="timer-card">
                <div class="timer-header">
                    <i class="fas fa-clock"></i>
                    <span>Pomodoro Timer</span>
                    <div class="timer-sessions">Sessions: <b id="sessionCount">0</b></div>
                </div>
                <div class="timer-display" id="timerDisplay">25:00</div>
                <div class="timer-mode" id="timerMode">Focus Time</div>
                <div class="timer-controls">
                    <button id="timerToggle" class="timer-btn timer-btn-primary">
                        <i class="fas fa-play"></i> Start
                    </button>
                    <button id="timerReset" class="timer-btn timer-btn-outline">
                        <i class="fas fa-redo"></i>
                    </button>
                    <button id="timerSettings" class="timer-btn timer-btn-outline">
                        <i class="fas fa-cog"></i>
                    </button>
                </div>
                <div class="timer-settings" id="timerSettingsPanel" style="display:none">
                    <div class="timer-setting-row">
                        <label>Focus (min)</label>
                        <input type="number" id="focusMin" value="25" min="1" max="60">
                    </div>
                    <div class="timer-setting-row">
                        <label>Break (min)</label>
                        <input type="number" id="breakMin" value="5" min="1" max="30">
                    </div>
                    <div class="timer-setting-row">
                        <label>Long Break (min)</label>
                        <input type="number" id="longBreakMin" value="15" min="1" max="60">
                    </div>
                </div>
            </div>
        `;

        document.getElementById('timerToggle').addEventListener('click', () => this.toggle());
        document.getElementById('timerReset').addEventListener('click', () => this.reset());
        document.getElementById('timerSettings').addEventListener('click', () => {
            const panel = document.getElementById('timerSettingsPanel');
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        });

        ['focusMin', 'breakMin', 'longBreakMin'].forEach(id => {
            document.getElementById(id)?.addEventListener('change', () => {
                if (!this.isRunning) this.reset();
            });
        });
    },

    toggle() {
        if (this.isRunning) {
            this.pause();
        } else {
            this.start();
        }
    },

    start() {
        this.isRunning = true;
        this.updateToggleBtn();
        this.timerId = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();
            if (this.timeLeft <= 0) {
                this.complete();
            }
        }, 1000);
    },

    pause() {
        this.isRunning = false;
        clearInterval(this.timerId);
        this.updateToggleBtn();
    },

    reset() {
        this.pause();
        this.isBreak = false;
        const focusMin = parseInt(document.getElementById('focusMin')?.value || 25);
        this.timeLeft = focusMin * 60;
        this.updateDisplay();
        document.getElementById('timerMode').textContent = 'Focus Time';
        document.querySelector('.timer-display').classList.remove('timer-break');
    },

    complete() {
        this.pause();
        // Play a soft notification sound could go here
        if (!this.isBreak) {
            this.sessions++;
            document.getElementById('sessionCount').textContent = this.sessions;
            // Track in user stats
            const user = Auth.getUser();
            if (user) {
                Auth.addStudyTime('general', 25);
                Auth.updateStreak();
            }
        }

        // Switch mode
        this.isBreak = !this.isBreak;
        if (this.isBreak) {
            const breakMin = this.sessions % 4 === 0
                ? parseInt(document.getElementById('longBreakMin')?.value || 15)
                : parseInt(document.getElementById('breakMin')?.value || 5);
            this.timeLeft = breakMin * 60;
            document.getElementById('timerMode').textContent = this.sessions % 4 === 0 ? 'Long Break!' : 'Short Break';
            document.querySelector('.timer-display').classList.add('timer-break');
        } else {
            const focusMin = parseInt(document.getElementById('focusMin')?.value || 25);
            this.timeLeft = focusMin * 60;
            document.getElementById('timerMode').textContent = 'Focus Time';
            document.querySelector('.timer-display').classList.remove('timer-break');
        }
        this.updateDisplay();
    },

    updateDisplay() {
        const m = Math.floor(this.timeLeft / 60);
        const s = this.timeLeft % 60;
        document.getElementById('timerDisplay').textContent =
            `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    },

    updateToggleBtn() {
        const btn = document.getElementById('timerToggle');
        if (this.isRunning) {
            btn.innerHTML = '<i class="fas fa-pause"></i> Pause';
            btn.classList.add('timer-btn-active');
        } else {
            btn.innerHTML = '<i class="fas fa-play"></i> Start';
            btn.classList.remove('timer-btn-active');
        }
    }
};

document.addEventListener('DOMContentLoaded', () => StudyTimer.init());
