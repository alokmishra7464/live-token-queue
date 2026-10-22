const mongoose = require('mongoose');

// One document per phone number. We only store a HASH of the OTP.
const otpSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  otpHash: String,
  expiresAt: Date,
  attempts: { type: Number, default: 0 },
  valid: { type: Boolean, default: false },
  lastSentAt: Date,
  requestTimes: [Date], // used for the "5 per hour" limit
});

module.exports = mongoose.model('Otp', otpSchema);
