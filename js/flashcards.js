/* ========================================
   Flashcards System
   ======================================== */

const Flashcards = {
    cards: [],
    decks: [],
    currentDeck: 'all',
    studyQueue: [],
    studyIndex: 0,

    init() {
        if (!Auth.protectRoute()) return;
        Auth.updateUserDisplay();
        this.loadCards();
        this.bindEvents();
    },

    bindEvents() {
        document.getElementById('createDeckBtn').addEventListener('click', () => this.createDeck());
        document.getElementById('addCardBtn').addEventListener('click', () => this.addCard());
        document.getElementById('flashcard').addEventListener('click', () => {
            document.getElementById('flashcard').classList.toggle('flipped');
        });
        document.getElementById('btnHard').addEventListener('click', () => this.rateCard('hard'));
        document.getElementById('btnMedium').addEventListener('click', () => this.rateCard('medium'));
        document.getElementById('btnEasy').addEventListener('click', () => this.rateCard('easy'));

        document.getElementById('deckList').addEventListener('click', (e) => {
            const item = e.target.closest('.deck-item');
            if (!item) return;
            document.querySelectorAll('.deck-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            this.currentDeck = item.dataset.deck;
            this.renderCards();
        });
    },

    async loadCards() {
        if (typeof ApiClient !== 'undefined' && ApiClient.token) {
            const data = await ApiClient.getFlashcards();
            this.cards = data?.cards || [];
            const deckData = await ApiClient.getFlashcardDecks();
            this.decks = deckData?.decks || [];
        } else {
            const user = Auth.getUser();
            this.cards = user?.flashcards || [];
            const deckMap = {};
            this.cards.forEach(c => {
                if (!deckMap[c.deck_name]) deckMap[c.deck_name] = { deck_name: c.deck_name, count: 0, mastered_count: 0 };
                deckMap[c.deck_name].count++;
                if (c.mastered) deckMap[c.deck_name].mastered_count++;
            });
            this.decks = Object.values(deckMap);
        }
        this.renderDecks();
        this.renderCards();
        this.populateDeckSelect();
    },

    renderDecks() {
        const list = document.getElementById('deckList');
        let html = `<li class="deck-item ${this.currentDeck === 'all' ? 'active' : ''}" data-deck="all">
            <span>All Cards</span><span class="deck-count">${this.cards.length}</span></li>`;
        this.decks.forEach(d => {
            html += `<li class="deck-item ${this.currentDeck === d.deck_name ? 'active' : ''}" data-deck="${d.deck_name}">
                <span>${d.deck_name}</span><span class="deck-count">${d.count}</span></li>`;
        });
        list.innerHTML = html;
    },

    populateDeckSelect() {
        const select = document.getElementById('cardDeckSelect');
        select.innerHTML = this.decks.map(d => `<option value="${d.deck_name}">${d.deck_name}</option>`).join('');
        if (this.decks.length === 0) {
            select.innerHTML = '<option value="General">General</option>';
        }
    },

    renderCards() {
        const grid = document.getElementById('cardGrid');
        let filtered = this.currentDeck === 'all' ? this.cards : this.cards.filter(c => c.deck_name === this.currentDeck);

        if (filtered.length === 0) {
            grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
                <i class="fas fa-layer-group"></i>
                <p>No cards in this deck yet. Add your first card above.</p>
            </div>`;
            return;
        }

        grid.innerHTML = filtered.map(c => `
            <div class="card-item ${c.mastered ? 'mastered' : ''}">
                <div class="card-front">${c.front}</div>
                <div class="card-back">${c.back}</div>
                <div class="card-actions">
                    <button class="btn btn-sm btn-success" onclick="Flashcards.studyCard(${c.id})"><i class="fas fa-play"></i> Study</button>
                    <button class="btn btn-sm btn-outline" onclick="Flashcards.deleteCard(${c.id})"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `).join('');

        // Auto-start study mode if cards exist
        if (filtered.length > 0 && !document.getElementById('studyArea').style.display) {
            this.startStudy(filtered);
        }
    },

    createDeck() {
        const input = document.getElementById('newDeckName');
        const name = input.value.trim();
        if (!name) return;
        if (!this.decks.find(d => d.deck_name === name)) {
            this.decks.push({ deck_name: name, count: 0, mastered_count: 0 });
        }
        input.value = '';
        this.renderDecks();
        this.populateDeckSelect();
    },

    async addCard() {
        const deck = document.getElementById('cardDeckSelect').value;
        const front = document.getElementById('cardFront').value.trim();
        const back = document.getElementById('cardBack').value.trim();
        if (!front || !back) return alert('Fill in both sides');

        const newCard = {
            id: Date.now(),
            deck_name: deck,
            front,
            back,
            mastered: false,
            review_count: 0,
            created_at: new Date().toISOString()
        };

        if (typeof ApiClient !== 'undefined' && ApiClient.token) {
            const data = await ApiClient.createFlashcard(deck, front, back);
            if (data?.card) newCard.id = data.card.id;
        } else {
            const user = Auth.getUser();
            if (!user.flashcards) user.flashcards = [];
            user.flashcards.push(newCard);
            Auth.saveUser(user);
        }

        this.cards.push(newCard);
        const deckEntry = this.decks.find(d => d.deck_name === deck);
        if (deckEntry) deckEntry.count++;
        else this.decks.push({ deck_name: deck, count: 1, mastered_count: 0 });

        document.getElementById('cardFront').value = '';
        document.getElementById('cardBack').value = '';
        this.renderDecks();
        this.renderCards();
        this.populateDeckSelect();
    },

    studyCard(id) {
        const card = this.cards.find(c => c.id == id);
        if (!card) return;
        this.startStudy([card]);
    },

    startStudy(cards) {
        this.studyQueue = [...cards];
        this.studyIndex = 0;
        document.getElementById('studyArea').style.display = 'flex';
        document.getElementById('studyArea').scrollIntoView({ behavior: 'smooth' });
        this.showCard();
    },

    showCard() {
        if (this.studyIndex >= this.studyQueue.length) {
            document.getElementById('studyArea').innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-check-circle" style="color:#10b981"></i>
                    <h3>Deck Complete!</h3>
                    <p>You've reviewed all cards in this session.</p>
                    <button class="btn btn-primary" onclick="Flashcards.endStudy()">Back to Cards</button>
                </div>`;
            return;
        }
        const card = this.studyQueue[this.studyIndex];
        document.getElementById('cardFrontDisplay').textContent = card.front;
        document.getElementById('cardBackDisplay').textContent = card.back;
        document.getElementById('flashcard').classList.remove('flipped');
        document.getElementById('studyCounter').textContent = `${this.studyIndex + 1} / ${this.studyQueue.length}`;
        document.getElementById('studyProgressFill').style.width = `${((this.studyIndex) / this.studyQueue.length) * 100}%`;
    },

    async rateCard(rating) {
        const card = this.studyQueue[this.studyIndex];
        if (rating === 'easy') {
            card.mastered = true;
            if (typeof ApiClient !== 'undefined' && ApiClient.token) {
                await ApiClient.updateFlashcard(card.id, { mastered: true });
            }
        }
        this.studyIndex++;
        this.showCard();
        this.renderCards();
    },

    endStudy() {
        document.getElementById('studyArea').style.display = 'none';
        location.reload();
    },

    async deleteCard(id) {
        if (!confirm('Delete this card?')) return;
        if (typeof ApiClient !== 'undefined' && ApiClient.token) {
            await ApiClient.deleteFlashcard(id);
        } else {
            const user = Auth.getUser();
            user.flashcards = (user.flashcards || []).filter(c => c.id != id);
            Auth.saveUser(user);
        }
        this.cards = this.cards.filter(c => c.id != id);
        this.renderDecks();
        this.renderCards();
    }
};

document.addEventListener('DOMContentLoaded', () => Flashcards.init());
