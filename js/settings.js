/* ========================================
   Settings Page
   ======================================== */

const Settings = {
    init() {
        if (!Auth.protectRoute()) return;
        Auth.updateUserDisplay();
        this.renderBackendStatus();
        this.bindEvents();
    },

    renderBackendStatus() {
        const base = localStorage.getItem('api_base');
        const statusEl = document.getElementById('backendStatus');
        const urlInput = document.getElementById('backendUrl');
        const disconnectBtn = document.getElementById('disconnectBtn');
        const syncSection = document.getElementById('syncSection');

        if (base) {
            urlInput.value = base;
            statusEl.innerHTML = '<span class="status-dot online"></span><span>Connected</span>';
            disconnectBtn.style.display = 'inline-flex';
            syncSection.style.display = 'block';
        } else {
            statusEl.innerHTML = '<span class="status-dot offline"></span><span>Not connected (using local storage)</span>';
            disconnectBtn.style.display = 'none';
            syncSection.style.display = 'none';
        }
    },

    bindEvents() {
        document.getElementById('saveBackendBtn').addEventListener('click', async () => {
            const url = document.getElementById('backendUrl').value.trim();
            if (!url) return;
            localStorage.setItem('api_base', url.replace(/\/$/, ''));
            location.reload();
        });

        document.getElementById('testBackendBtn').addEventListener('click', async () => {
            const url = document.getElementById('backendUrl').value.trim();
            if (!url) return alert('Enter a URL first');
            try {
                const res = await fetch(`${url.replace(/\/$/, '')}/health`);
                const data = await res.json();
                if (data.status === 'ok') {
                    alert('Backend is reachable!');
                } else {
                    alert('Backend responded but status is not ok');
                }
            } catch {
                alert('Could not reach backend. Check the URL.');
            }
        });

        document.getElementById('disconnectBtn').addEventListener('click', () => {
            if (!confirm('Disconnect from backend? Data will stay local.')) return;
            localStorage.removeItem('api_base');
            localStorage.removeItem('learnai_token');
            location.reload();
        });

        document.getElementById('syncDataBtn').addEventListener('click', async () => {
            if (!confirm('This will sync all local data to the backend. Continue?')) return;
            await syncLocalDataToBackend();
            alert('Sync complete!');
        });

        document.getElementById('exportDataBtn').addEventListener('click', () => {
            const data = localStorage.getItem('learnai_user');
            if (!data) return alert('No local data to export');
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'learnai-data.json';
            a.click();
            URL.revokeObjectURL(url);
        });

        document.getElementById('clearDataBtn').addEventListener('click', () => {
            if (!confirm('This will delete ALL local data. This cannot be undone!')) return;
            localStorage.clear();
            alert('All local data cleared. Reloading...');
            location.href = 'index.html';
        });

        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const theme = btn.dataset.theme;
                document.documentElement.setAttribute('data-theme', theme);
                localStorage.setItem('theme', theme);
            });
        });
    }
};

document.addEventListener('DOMContentLoaded', () => Settings.init());
