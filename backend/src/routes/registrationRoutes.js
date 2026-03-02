const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { register } = require('../controllers/registrationController');

const router = express.Router();

// Rate limiter: max 5 registration attempts per 15 minutes per IP
const registrationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per `window`
    message: {
        status: 'error',
        message: 'Too many registration attempts from this IP, please try again after 15 minutes.'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const registrationValidation = [
    body('firstName').matches(/^[A-Z][a-z]{1,29}$/).withMessage('First name must start with a capital letter and contain only alphabets.'),
    body('lastName').matches(/^[A-Z][a-z]{1,29}$/).withMessage('Last name must start with a capital letter and contain only alphabets.'),
    body('email').isEmail().withMessage('Please enter a valid email address.'),
    body('age').isInt({ min: 18 }).withMessage('You must be at least 18 years old.'),
    body('eventTitle').notEmpty().withMessage('Event title is required.')
];

router.post('/register', registrationLimiter, registrationValidation, register);

module.exports = router;
