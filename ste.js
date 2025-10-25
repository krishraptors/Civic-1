const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendTestEmail() {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.SMTP_USER,
      subject: "Test Email - Civic Report",
      text: "If you received this, your email setup works!",
    });
    console.log("✅ Email sent:", info.response);
  } catch (err) {
    console.error("❌ Email send failed:", err);
  }
}

sendTestEmail();
