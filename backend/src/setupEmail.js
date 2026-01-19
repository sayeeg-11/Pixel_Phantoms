const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

(async () => {
    try {
        console.log('Generating Ethereal credentials...');
        const testAccount = await nodemailer.createTestAccount();

        console.log('User:', testAccount.user);
        console.log('Pass:', testAccount.pass);

        const envPath = path.join(__dirname, '../../.env');
        if (fs.existsSync(envPath)) {
            let envContent = fs.readFileSync(envPath, 'utf8');

            // Regex to replace existing lines or append if missing (simplified for existing file)
            envContent = envContent.replace(/EMAIL_USER=.*/g, `EMAIL_USER=${testAccount.user}`);
            envContent = envContent.replace(/EMAIL_PASS=.*/g, `EMAIL_PASS=${testAccount.pass}`);

            fs.writeFileSync(envPath, envContent);
            console.log('✅ .env file updated automatically with new credentials.');
        } else {
            console.error('❌ .env file not found at:', envPath);
        }

    } catch (error) {
        console.error('Failed to create account:', error);
    }
})();
