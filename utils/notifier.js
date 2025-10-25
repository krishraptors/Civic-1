const webpush = require('web-push');
const { sendMail } = require('./mailer');
const User = require('../models/User');

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:admin@example.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

async function notifyByEmail(email, subject, text, html) {
  try {
    if (!email) return;
    await sendMail({ to: email, subject, text, html });
  } catch (err) {
    console.error('Email notify error', err);
  }
}

// subscription = user's stored push subscription object
async function notifyByPush(subscription, payload) {
  try {
    if (!subscription || !process.env.VAPID_PUBLIC_KEY) return;
    await webpush.sendNotification(subscription, JSON.stringify(payload));
  } catch (err) {
    console.error('Push notification error', err);
  }
}

async function notifyUser(userId, payload) {
  try {
    const user = await User.findById(userId);
    if (!user) return;
    if (user.email) {
      await notifyByEmail(user.email, payload.title || 'Update', payload.message || '', payload.html || '');
    }
    if (user.pushSubscription) await notifyByPush(user.pushSubscription, payload);
  } catch (err) {
    console.error('notifyUser error', err);
  }
}

module.exports = { notifyByEmail, notifyByPush, notifyUser };
