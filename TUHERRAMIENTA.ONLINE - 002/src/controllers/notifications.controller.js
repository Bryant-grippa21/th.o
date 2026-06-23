const {
  listNotificationsForUser,
  markNotificationAsRead,
  markAllNotificationsAsRead
} = require('../services/notifications.service');

const getNotifications = async (req, res) => {
  try {
    const notifications = await listNotificationsForUser(req.user);
    return res.status(200).json({ notifications });
  } catch (error) {
    console.error('ERROR GET NOTIFICATIONS:', error);
    return res.status(500).json({ error: error.message });
  }
};

const readNotification = async (req, res) => {
  try {
    const eventKey = decodeURIComponent(String(req.params.notificationId || '').trim());

    if (!eventKey) {
      return res.status(400).json({ error: 'notificationId inválido' });
    }

    const notifications = await markNotificationAsRead(req.user, eventKey);
    return res.status(200).json({ notifications });
  } catch (error) {
    console.error('ERROR READ NOTIFICATION:', error);
    return res.status(500).json({ error: error.message });
  }
};

const readAllNotifications = async (req, res) => {
  try {
    const notifications = await markAllNotificationsAsRead(req.user);
    return res.status(200).json({ notifications });
  } catch (error) {
    console.error('ERROR READ ALL NOTIFICATIONS:', error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getNotifications,
  readNotification,
  readAllNotifications
};