const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../../.env') });

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_PORT == 465,
  auth: {
    user: process.env.EMAIL_USER || 'placeholder@ethereal.email',
    pass: process.env.EMAIL_PASS || 'placeholder_pass',
  },
});

const sendRegistrationEmail = async (user, event) => {
  const mailOptions = {
    from: `"Pixel Phantoms" <${process.env.EMAIL_FROM || 'noreply@pixelphantoms.com'}>`,
    to: user.email,
    subject: `Registration Confirmed: ${event.title}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden; background-color: #f9f9f9;">
        <div style="background: linear-gradient(135deg, #00aaff, #0088cc); padding: 20px; text-align: center; color: white;">
          <h1 style="margin: 0;">Pixel Phantoms</h1>
          <p style="margin: 5px 0 0; font-size: 1.1rem;">Registration Confirmed!</p>
        </div>
        <div style="padding: 30px; color: #333;">
          <p>Hi <strong>${user.firstName} ${user.lastName}</strong>,</p>
          <p>Thank you for registering for <strong>${event.title}</strong>. We're excited to have you join us!</p>
          <div style="background: #fff; padding: 20px; border-radius: 8px; border: 1px solid #eee; margin: 20px 0;">
            <p style="margin: 0 0 10px;"><strong>Event Details:</strong></p>
            <p style="margin: 5px 0; display: flex; align-items: center;">
              <span style="min-width: 120px; display: inline-block;">📅 <strong>Date:</strong></span>
              <span>${new Date(event.date).toLocaleDateString()}</span>
            </p>
            <p style="margin: 5px 0; display: flex; align-items: center;">
              <span style="min-width: 120px; display: inline-block;">🕒 <strong>Time:</strong></span>
              <span>${new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </p>
            <p style="margin: 5px 0; display: flex; align-items: center;">
              <span style="min-width: 120px; display: inline-block;">📍 <strong>Venue:</strong></span>
              <span>${event.location || 'Online'}</span>
            </p>
          </div>
          <p>Please keep this email for your records. If you have any questions, feel free to contact the core committee.</p>
          <p>See you there!</p>
          <p>Best regards,<br>The Pixel Phantoms Team</p>
        </div>
        <div style="background: #eee; padding: 15px; text-align: center; font-size: 0.8rem; color: #777;">
          &copy; 2024 Pixel Phantoms. All rights reserved.
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Confirmation email sent:', info.messageId);

    // For Ethereal, log the preview URL
    if (process.env.EMAIL_HOST === 'smtp.ethereal.email') {
      console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
    }

    return true;
  } catch (error) {
    console.error('❌ Error sending confirmation email:', error.message);
    return false;
  }
};

module.exports = { sendRegistrationEmail };
