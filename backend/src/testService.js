const { sendRegistrationEmail } = require('./services/emailService');

const dummyUser = {
    firstName: 'Debug',
    lastName: 'Tester',
    email: 'chhimakshi@gmail.com' // Targeting the user's requested email
};

const dummyEvent = {
    title: 'Debug Event',
    date: new Date(),
    location: 'Test Lab'
};

async function run() {
    console.log('🧪 Testing emailService.js module...');

    // Log what the service is seeing
    console.log('DEBUG ENV CHECK in Test Script:');
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    // Note: process.env might be empty here if emailService loads it, 
    // or if we rely on the service to load it. 
    // emailService has require('dotenv').config(...) at the top.

    try {
        const result = await sendRegistrationEmail(dummyUser, dummyEvent);
        if (result) {
            console.log('✅ Service returned TRUE. Email sent.');
        } else {
            console.log('❌ Service returned FALSE. Email failed.');
        }
    } catch (e) {
        console.error('💥 Exception:', e);
    }
}

run();
