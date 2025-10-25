const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: Number(process.env.SMTP_PORT) === 465, // true for port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

async function sendMail({ to, subject, text, html }) {
  const from = process.env.EMAIL_FROM;
  if (!transporter) throw new Error('Mailer not configured');
  const info = await transporter.sendMail({ from, to, subject, text, html });
  return info;
}

module.exports = { sendMail };
