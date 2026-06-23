const express = require('express');

const router = express.Router();

const { verifyToken } = require('../middlewares/auth.middleware');
const {
  getNotifications,
  readNotification,
  readAllNotifications
} = require('../controllers/notifications.controller');

router.get('/', verifyToken, getNotifications);
router.put('/read-all', verifyToken, readAllNotifications);
router.put('/:notificationId/read', verifyToken, readNotification);

module.exports = router;