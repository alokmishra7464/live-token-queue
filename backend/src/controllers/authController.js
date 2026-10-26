const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');
const otpService = require('../services/otpService');

const cleanPhone = (p) => String(p || '').replace(/[\s-]/g, '');
const isValidPhone = (p) => /^\+?\d{10,15}$/.test(p);

const adminPhones = () =>
  (process.env.ADMIN_PHONES || '').split(',').map(cleanPhone).filter(Boolean);

exports.requestOtp = asyncHandler(async (req, res) => {
  const phone = cleanPhone(req.body.phone);
  if (!isValidPhone(phone)) throw httpError(400, 'Enter a valid phone number');

  const otp = await otpService.sendOtp(phone);

  // DEMO MODE: no SMS provider, so we send the OTP back to show in a pop-up.
  // With a real SMS provider, remove `otp` from this response.
  res.json({ message: 'OTP generated', otp });
});

exports.verifyOtp = asyncHandler(async (req, res) => {
  const phone = cleanPhone(req.body.phone);
  const otp = String(req.body.otp || '');
  if (!isValidPhone(phone) || !/^\d{6}$/.test(otp)) throw httpError(400, 'Phone and 6-digit OTP required');

  await otpService.verifyOtp(phone, otp);

  // Only pre-approved numbers become admins. No expiry => stays logged in until logout.
  const role = adminPhones().includes(phone) ? 'admin' : 'customer';
  const token = jwt.sign({ phone, role }, process.env.JWT_SECRET);
  res.json({ token, user: { phone, role } });
});
