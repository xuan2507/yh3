const { pool } = require('./config');

const schema = `
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    exam_type VARCHAR(50) DEFAULT 'A-Level',
    plan VARCHAR(20) DEFAULT 'free',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quiz_results (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(50) NOT NULL,
    score INTEGER NOT NULL,
    total INTEGER NOT NULL,
    topic VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mistakes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(50) NOT NULL,
    question TEXT NOT NULL,
    correct_answer TEXT NOT NULL,
    user_answer TEXT NOT NULL,
    explanation TEXT,
    topic VARCHAR(100) DEFAULT 'General',
    mastered BOOLEAN DEFAULT FALSE,
    attempts INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS topic_mastery (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(50) NOT NULL,
    topic VARCHAR(100) NOT NULL,
    score INTEGER DEFAULT 0,
    attempts INTEGER DEFAULT 0,
    last_seen TIMESTAMP,
    correct_streak INTEGER DEFAULT 0,
    UNIQUE(user_id, subject, topic)
);

CREATE TABLE IF NOT EXISTS goals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(50) NOT NULL,
    target_grade VARCHAR(10) NOT NULL,
    current_grade VARCHAR(10) DEFAULT 'U',
    deadline DATE NOT NULL,
    daily_target_hours DECIMAL(4,1) DEFAULT 0,
    gap INTEGER DEFAULT 0,
    days_left INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS memory_decay (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(50) NOT NULL,
    topic VARCHAR(100) NOT NULL,
    last_revised TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revision_count INTEGER DEFAULT 0,
    UNIQUE(user_id, subject, topic)
);

CREATE TABLE IF NOT EXISTS adaptive_levels (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(50) NOT NULL,
    level INTEGER DEFAULT 1,
    UNIQUE(user_id, subject)
);

CREATE TABLE IF NOT EXISTS study_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(50) DEFAULT 'general',
    minutes INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tutor_messages (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookmarks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    item_id VARCHAR(100) NOT NULL,
    item_type VARCHAR(50) DEFAULT 'resource',
    data JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_quiz_results_user ON quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_mistakes_user ON mistakes(user_id);
CREATE INDEX IF NOT EXISTS idx_topic_mastery_user ON topic_mastery(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user ON study_sessions(user_id);
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    plan VARCHAR(20) DEFAULT 'pro',
    amount DECIMAL(10,2) NOT NULL,
    method VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    reference TEXT,
    receipt_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS flashcards (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    deck_name VARCHAR(100) NOT NULL,
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    subject VARCHAR(50) DEFAULT 'general',
    mastered BOOLEAN DEFAULT FALSE,
    review_count INTEGER DEFAULT 0,
    last_reviewed TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tutor_messages_user ON tutor_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_user ON flashcards(user_id);
`;

async function init() {
    try {
        await pool.query(schema);
        console.log('Database initialized successfully');
        process.exit(0);
    } catch (err) {
        console.error('Database init failed:', err.message);
        process.exit(1);
    }
}

init();
