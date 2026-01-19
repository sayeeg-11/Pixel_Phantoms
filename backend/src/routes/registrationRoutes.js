const express = require('express');
const { body } = require('express-validator');
const { register } = require('../controllers/registrationController');

const router = express.Router();

const registrationValidation = [
    body('firstName').matches(/^[A-Z][a-z]{1,29}$/).withMessage('First name must start with a capital letter and contain only alphabets.'),
    body('lastName').matches(/^[A-Z][a-z]{1,29}$/).withMessage('Last name must start with a capital letter and contain only alphabets.'),
    body('email').isEmail().withMessage('Please enter a valid email address.'),
    body('age').isInt({ min: 18 }).withMessage('You must be at least 18 years old.'),
    body('eventTitle').notEmpty().withMessage('Event title is required.')
];

router.post('/register', registrationValidation, register);

module.exports = router;
