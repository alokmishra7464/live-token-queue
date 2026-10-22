const router = require('express').Router();
const { requireAuth, requireAdmin } = require('../middleware/auth');
const c = require('../controllers/adminController');

router.use(requireAuth, requireAdmin); // every admin route is protected

router.get('/queue', c.queue);
router.post('/next', c.next);
router.post('/:id/done', c.done);
router.post('/:id/skip', c.skip);

module.exports = router;
