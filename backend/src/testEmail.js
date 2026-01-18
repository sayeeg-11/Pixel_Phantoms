const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

function log(message) {
    console.log(message);
    try {
        fs.appendFileSync('email_diagnostic_result.txt', message + '\n');
    } catch (e) {
        console.error('Failed to write log:', e);
    }
}

async function testEmail() {
    try {
        fs.writeFileSync('email_diagnostic_result.txt', ''); // Clear file
    } catch (e) { }

    log('🔍 Testing Email Configuration...');
    log(`Host: ${process.env.EMAIL_HOST}`);
    log(`User: ${process.env.EMAIL_USER}`);

    // Check if password has spaces (common copy paste error)
    if (process.env.EMAIL_PASS && process.env.EMAIL_PASS.includes(' ')) {
        log('⚠️ WARNING: Password contains spaces. This is usually okay for App Passwords, but ensure it is correct.');
    }

    log(`Pass length: ${process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : '0'}`);

    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false, // 587 -> STARTTLS
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    try {
        log('🔌 Verifying SMTP connection...');
        await transporter.verify();
        log('✅ SMTP Connection Successful!');

        log('📧 Sending test email to him058980@gmail.com...');
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: 'him058980@gmail.com', // Send to requested address
            subject: 'Test Email from Pixel Phantoms Debugger',
            text: 'If you see this, your email configuration is working perfectly!',
        });

        log('✅ Email sent successfully!');
        log('Message ID: ' + info.messageId);
    } catch (error) {
        log('❌ Email Test Failed!');
        log('Error: ' + error.message);
        if (error.response) log('SMTP Response: ' + error.response);
    }
}

testEmail();
