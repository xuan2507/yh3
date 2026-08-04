const { body, validationResult } = require('express-validator');

// Helper to check validation results
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            error: 'Validation failed',
            details: errors.array().map(e => ({ field: e.path, message: e.msg }))
        });
    }
    next();
};

// Auth validation rules
const registerRules = [
    body('email')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail()
        .isLength({ max: 255 }).withMessage('Email too long'),
    body('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
        .matches(/[a-z]/).withMessage('Password must contain a lowercase letter')
        .matches(/[0-9]/).withMessage('Password must contain a number')
        .isLength({ max: 128 }).withMessage('Password too long'),
    body('firstName')
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 }).withMessage('First name must be 1-100 characters')
        .matches(/^[a-zA-Z\s'-]+$/).withMessage('First name contains invalid characters'),
    body('lastName')
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 }).withMessage('Last name must be 1-100 characters')
        .matches(/^[a-zA-Z\s'-]+$/).withMessage('Last name contains invalid characters'),
    body('examType')
        .optional()
        .isIn(['alevel', 'igcse', 'ielts', 'multiple']).withMessage('Invalid exam type'),
];

const loginRules = [
    body('email')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 1, max: 128 }).withMessage('Password required'),
];

// Payment validation rules
const paymentRules = [
    body('plan').optional().isIn(['free', 'pro']).withMessage('Invalid plan'),
    body('amount').isFloat({ min: 0 }).withMessage('Invalid amount'),
    body('method').isIn(['tng', 'bank', 'card']).withMessage('Invalid payment method'),
    body('reference')
        .isLength({ min: 3, max: 100 }).withMessage('Reference must be 3-100 characters')
        .matches(/^[a-zA-Z0-9-_]+$/).withMessage('Reference contains invalid characters'),
];

module.exports = {
    handleValidationErrors,
    registerRules,
    loginRules,
    paymentRules,
};
