const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const c = require('../controllers/tokenController');

router.post('/', requireAuth, c.getToken);   // Get Token
router.get('/me', requireAuth, c.myStatus);  // my token + now serving + people ahead

module.exports = router;
