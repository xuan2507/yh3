require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/quizzes', require('./routes/quizzes'));
app.use('/api/mistakes', require('./routes/mistakes'));
app.use('/api/goals', require('./routes/goals'));
app.use('/api/mastery', require('./routes/mastery'));
app.use('/api/study', require('./routes/study'));
app.use('/api/tutor', require('./routes/tutor'));
app.use('/api/predictions', require('./routes/predictions'));
app.use('/api/bookmarks', require('./routes/bookmarks'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/flashcards', require('./routes/flashcards'));

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
    console.log(`LearnAI backend running on port ${PORT}`);
});
