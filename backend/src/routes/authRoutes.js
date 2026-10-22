const router = require('express').Router();
const c = require('../controllers/authController');

router.post('/request-otp', c.requestOtp);
router.post('/verify-otp', c.verifyOtp);

module.exports = router;
