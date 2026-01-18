const { validationResult } = require('express-validator');
const sequelize = require('../config/database');
const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const { sendRegistrationEmail } = require('../services/emailService');
const fs = require('fs');
const path = require('path');

// Load events data
const eventsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../data/events.json'), 'utf8'));

const register = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ status: 'error', errors: errors.array() });
    }

    const { firstName, lastName, email, age, eventTitle } = req.body;
    const transaction = await sequelize.transaction();

    try {
        // 1. Find or create user
        const [user] = await User.findOrCreate({
            where: { email },
            defaults: { firstName, lastName, age },
            transaction
        });

        // 2. Find event
        let event = await Event.findOne({ where: { title: eventTitle }, transaction });

        // Get event data from JSON
        const eventData = eventsData.find(e => e.title === eventTitle);

        // If event doesn't exist in DB, create it
        if (!event) {
            if (eventData) {
                event = await Event.create({
                    title: eventTitle,
                    date: new Date(eventData.countdownDate),
                    location: eventData.location,
                    capacity: 100
                }, { transaction });
            } else {
                // Fallback to placeholder if not found in JSON
                event = await Event.create({
                    title: eventTitle,
                    date: new Date(),
                    location: 'To be announced',
                    capacity: 100
                }, { transaction });
            }
        } else {
            // If event exists but we have JSON data, update it to ensure correct date/location
            if (eventData) {
                await event.update({
                    date: new Date(eventData.countdownDate),
                    location: eventData.location
                }, { transaction });
            }
        }

        // 3. Check if already registered
        const existingRegistration = await Registration.findOne({
            where: { UserId: user.id, EventId: event.id },
            transaction
        });

        if (existingRegistration) {
            await transaction.rollback();
            return res.status(400).json({
                status: 'error',
                message: 'You are already registered for this event.'
            });
        }

        // 4. Check capacity
        if (event.registeredCount >= event.capacity) {
            await transaction.rollback();
            return res.status(400).json({
                status: 'error',
                message: 'Event is at full capacity.'
            });
        }

        // 5. Create registration
        const registration = await Registration.create({
            UserId: user.id,
            EventId: event.id
        }, { transaction });

        // 6. Update event registeredCount
        await event.increment('registeredCount', { by: 1, transaction });

        await transaction.commit();

        // 7. Send confirmation email (async, don't block response)
        sendRegistrationEmail(user, event).catch(err => console.error('Email failed:', err));

        res.status(201).json({
            status: 'success',
            message: 'Successfully registered for ' + event.title,
            data: { registrationId: registration.id }
        });

    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};

module.exports = { register };
