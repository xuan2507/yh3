require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { securityHeaders, authLimiter, apiLimiter, sanitizeErrors } = require('./middleware/security');

const app = express();
const PORT = process.env.PORT || 3000;

// Security headers FIRST
app.use(securityHeaders);

// CORS - restrict to known origins
const allowedOrigins = (process.env.FRONTEND_URL || '').split(',').filter(Boolean);
if (allowedOrigins.length === 0) {
    allowedOrigins.push('http://localhost:3000', 'http://localhost:5500');
}

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rate limited auth routes
app.use('/api/auth', authLimiter, require('./routes/auth'));

// General API rate limiting
app.use('/api', apiLimiter);
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

// Sanitized error handler
app.use(sanitizeErrors);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
    console.log(`LearnAI backend running securely on port ${PORT}`);
});
