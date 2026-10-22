const crypto = require('crypto');
const Otp = require('../models/Otp');
const httpError = require('../utils/httpError');

const EXPIRY_MS = 5 * 60 * 1000; // OTP valid for 5 minutes
const RESEND_MS = 30 * 1000;     // wait 30s before asking again
const MAX_ATTEMPTS = 3;          // wrong tries allowed
const MAX_PER_HOUR = 5;          // OTP requests per hour
const HOUR_MS = 60 * 60 * 1000;

// Never store the OTP itself, only this hash
const hashOtp = (phone, otp) =>
  crypto.createHmac('sha256', process.env.OTP_SECRET).update(`${phone}:${otp}`).digest('hex');

exports.sendOtp = async (phone) => {
  const now = Date.now();
  const record = (await Otp.findOne({ phone })) || new Otp({ phone });

  // Rule: 30 seconds between requests
  if (record.lastSentAt && now - record.lastSentAt < RESEND_MS) {
    const wait = Math.ceil((RESEND_MS - (now - record.lastSentAt)) / 1000);
    throw httpError(429, `Please wait ${wait}s before requesting a new OTP`);
  }

  // Rule: max 5 requests in the last hour
  const recent = record.requestTimes.filter((t) => now - t < HOUR_MS);
  if (recent.length >= MAX_PER_HOUR) {
    throw httpError(429, 'Too many OTP requests. Try again in an hour.');
  }

  const otp = String(crypto.randomInt(100000, 1000000)); // 6 digits
  record.otpHash = hashOtp(phone, otp);
  record.expiresAt = new Date(now + EXPIRY_MS);
  record.attempts = 0;
  record.valid = true;
  record.lastSentAt = new Date(now);
  record.requestTimes = [...recent, new Date(now)];
  await record.save();

  // Mock SMS: print to the server console
  console.log(`[MOCK SMS] OTP for ${phone}: ${otp}`);
};

exports.verifyOtp = async (phone, otp) => {
  const record = await Otp.findOne({ phone });
  if (!record || !record.valid) throw httpError(400, 'No active OTP. Please request a new one.');

  if (record.expiresAt < new Date()) {
    record.valid = false;
    await record.save();
    throw httpError(400, 'OTP expired. Please request a new one.');
  }

  if (record.otpHash !== hashOtp(phone, otp)) {
    record.attempts += 1;
    if (record.attempts >= MAX_ATTEMPTS) record.valid = false; // too many wrong tries
    await record.save();
    throw httpError(400, record.valid
      ? `Wrong OTP. ${MAX_ATTEMPTS - record.attempts} attempt(s) left.`
      : 'Too many wrong attempts. Please request a new OTP.');
  }

  record.valid = false; // an OTP can only be used once
  await record.save();
};
