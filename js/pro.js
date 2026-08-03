/* ========================================
   Pro / Payment Portal
   ======================================== */

const ProPortal = {
    init() {
        if (!Auth.protectRoute()) return;
        Auth.updateUserDisplay();
        this.bindEvents();
        this.loadPaymentHistory();
    },

    bindEvents() {
        document.getElementById('chooseProBtn').addEventListener('click', () => {
            document.getElementById('paymentPortal').style.display = 'block';
            document.getElementById('paymentPortal').scrollIntoView({ behavior: 'smooth' });
        });

        document.querySelectorAll('.pay-method').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.pay-method').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const method = btn.dataset.method;
                document.getElementById('tngForm').style.display = method === 'tng' ? 'block' : 'none';
                document.getElementById('bankForm').style.display = method === 'bank' ? 'block' : 'none';
                document.getElementById('cardForm').style.display = method === 'card' ? 'block' : 'none';
            });
        });

        document.getElementById('submitTngBtn').addEventListener('click', () => this.submitPayment('tng'));
        document.getElementById('submitBankBtn').addEventListener('click', () => this.submitPayment('bank'));
    },

    async submitPayment(method) {
        const refInput = method === 'tng' ? document.getElementById('tngRef') : document.getElementById('bankRef');
        const reference = refInput.value.trim();
        if (!reference) {
            alert('Please enter the transaction reference');
            return;
        }

        const btn = method === 'tng' ? document.getElementById('submitTngBtn') : document.getElementById('submitBankBtn');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

        if (typeof ApiClient !== 'undefined' && ApiClient.token) {
            const data = await ApiClient.createPayment('pro', 19.00, method, reference);
            if (data?.success) {
                alert('Payment request submitted! Your account will be upgraded once verified.');
                refInput.value = '';
                this.loadPaymentHistory();
            } else {
                alert('Failed to submit. Please try again.');
            }
        } else {
            // Local-only fallback
            const user = Auth.getUser();
            if (!user.payments) user.payments = [];
            user.payments.push({
                id: Date.now().toString(),
                plan: 'pro',
                amount: 19.00,
                method,
                reference,
                status: 'pending',
                created_at: new Date().toISOString()
            });
            Auth.saveUser(user);
            alert('Payment request saved locally. Connect backend for verification.');
            refInput.value = '';
        }

        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Payment Request';
    },

    async loadPaymentHistory() {
        const container = document.getElementById('paymentHistory');
        const list = document.getElementById('historyList');
        let payments = [];

        if (typeof ApiClient !== 'undefined' && ApiClient.token) {
            const data = await ApiClient.getMyPayments();
            payments = data?.payments || [];
        } else {
            const user = Auth.getUser();
            payments = user?.payments || [];
        }

        if (payments.length === 0) {
            container.style.display = 'none';
            return;
        }

        container.style.display = 'block';
        list.innerHTML = payments.map(p => `
            <div class="history-item">
                <div>
                    <strong>${p.method.toUpperCase()}</strong> — ${p.reference}
                    <br><small>${new Date(p.created_at).toLocaleDateString()}</small>
                </div>
                <span class="status ${p.status}">${p.status}</span>
            </div>
        `).join('');
    }
};

document.addEventListener('DOMContentLoaded', () => ProPortal.init());
