/**
 * LearnAI Pro Upgrade Portal
 */

const ProPortal = {
    isYearly: false,

    init() {
        if (!Auth.protectRoute()) return;
        Auth.updateUserDisplay();
        this.updatePriceDisplay();
        this.bindEvents();
        this.loadPaymentHistory();
        this.checkProStatus();
    },

    checkProStatus() {
        const user = Auth.getUser();
        if (user && user.plan === 'pro') {
            const btn = document.getElementById('chooseProBtn');
            if (btn) {
                btn.textContent = 'You\'re on Pro!';
                btn.disabled = true;
                btn.classList.remove('btn-primary');
                btn.classList.add('btn-success');
            }
            const badge = document.getElementById('planBadge');
            if (badge) {
                badge.textContent = 'Pro';
                badge.classList.add('pro');
            }
        }
    },

    updatePriceDisplay() {
        const proPrice = document.getElementById('proPrice');
        const tngAmount = document.getElementById('tngAmount');
        const bankAmount = document.getElementById('bankAmount');
        const portalPrice = document.getElementById('portalPrice');

        const monthlyPrice = 19;
        const yearlyPrice = 149;
        const price = this.isYearly ? yearlyPrice : monthlyPrice;
        const period = this.isYearly ? '/year' : '/month';

        if (proPrice) proPrice.innerHTML = `RM${price}<span>${period}</span>`;
        if (tngAmount) tngAmount.textContent = `RM${price}.00`;
        if (bankAmount) bankAmount.textContent = `RM${price}.00`;
        if (portalPrice) portalPrice.textContent = `RM${price}.00`;
    },

    bindEvents() {
        // Monthly / Yearly toggle
        const monthlyToggle = document.getElementById('monthlyToggle');
        const yearlyToggle = document.getElementById('yearlyToggle');

        if (monthlyToggle && yearlyToggle) {
            monthlyToggle.addEventListener('click', () => {
                this.isYearly = false;
                monthlyToggle.classList.add('active');
                yearlyToggle.classList.remove('active');
                this.updatePriceDisplay();
            });
            yearlyToggle.addEventListener('click', () => {
                this.isYearly = true;
                yearlyToggle.classList.add('active');
                monthlyToggle.classList.remove('active');
                this.updatePriceDisplay();
            });
        }

        // Choose Pro button
        const chooseBtn = document.getElementById('chooseProBtn');
        if (chooseBtn) {
            chooseBtn.addEventListener('click', () => {
                const portal = document.getElementById('paymentPortal');
                if (portal) {
                    portal.style.display = 'block';
                    portal.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        }

        // Payment method tabs
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

        // Submit buttons
        const tngBtn = document.getElementById('submitTngBtn');
        const bankBtn = document.getElementById('submitBankBtn');
        if (tngBtn) tngBtn.addEventListener('click', () => this.submitPayment('tng'));
        if (bankBtn) bankBtn.addEventListener('click', () => this.submitPayment('bank'));
    },

    async submitPayment(method) {
        const refInput = method === 'tng' ? document.getElementById('tngRef') : document.getElementById('bankRef');
        const reference = refInput ? refInput.value.trim() : '';
        const emailInput = document.getElementById('bankEmail');
        const email = emailInput ? emailInput.value.trim() : '';

        if (!reference) {
            UI.toast('Please enter the transaction reference.', 'warning');
            return;
        }
        if (method === 'bank' && !email) {
            UI.toast('Please enter your email for bank details.', 'warning');
            return;
        }

        const btn = method === 'tng' ? document.getElementById('submitTngBtn') : document.getElementById('submitBankBtn');
        if (btn) {
            btn.classList.add('loading');
            btn.disabled = true;
        }

        const amount = this.isYearly ? 149.00 : 19.00;
        const plan = this.isYearly ? 'pro-yearly' : 'pro-monthly';

        try {
            if (typeof ApiClient !== 'undefined' && ApiClient.token) {
                const data = await ApiClient.createPayment(plan, amount, method, reference);
                if (data?.success) {
                    UI.toast('Payment request submitted! Check your email for confirmation.', 'success');
                    this.clearForm(method);
                    this.loadPaymentHistory();
                } else {
                    UI.toast('Failed to submit. Please try again.', 'error');
                }
            } else {
                // Local-only fallback
                const user = Auth.getUser();
                if (!user.payments) user.payments = [];
                user.payments.unshift({
                    id: Date.now().toString(),
                    plan: plan,
                    amount: amount,
                    method,
                    reference,
                    status: 'pending',
                    created_at: new Date().toISOString()
                });
                Auth.saveUser(user);
                UI.toast('Payment request saved. Our team will verify and activate your Pro plan within 24 hours.', 'success');
                this.clearForm(method);
                this.loadPaymentHistory();
            }
        } catch (err) {
            UI.toast('Network error. Please try again.', 'error');
        } finally {
            if (btn) {
                btn.classList.remove('loading');
                btn.disabled = false;
            }
        }
    },

    clearForm(method) {
        if (method === 'tng') {
            const ref = document.getElementById('tngRef');
            if (ref) ref.value = '';
        } else {
            const ref = document.getElementById('bankRef');
            const email = document.getElementById('bankEmail');
            if (ref) ref.value = '';
            if (email) email.value = '';
        }
    },

    async loadPaymentHistory() {
        const container = document.getElementById('paymentHistory');
        const list = document.getElementById('historyList');
        if (!container || !list) return;

        let payments = [];

        if (typeof ApiClient !== 'undefined' && ApiClient.token) {
            try {
                const data = await ApiClient.getMyPayments();
                payments = data?.payments || [];
            } catch (e) {
                payments = [];
            }
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
