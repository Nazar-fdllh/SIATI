const { db } = require('../config/database');

/**
 * Get notifications for a user
 */
async function getUserNotifications(userId, { page = 1, limit = 20, unreadOnly = false }) {
  const offset = (page - 1) * limit;

  let query = db('notifications')
    .where('user_id', userId)
    .orderBy('created_at', 'desc');

  if (unreadOnly) query = query.where('is_read', false);

  const [{ count }] = await query.clone().clearOrder().count('* as count');
  const data = await query.limit(limit).offset(offset);

  const [{ unread_count }] = await db('notifications')
    .where({ user_id: userId, is_read: false })
    .count('* as unread_count');

  return {
    data,
    unread_count: parseInt(unread_count),
    meta: { page, limit, total: parseInt(count) },
  };
}

/**
 * Mark notification as read
 */
async function markAsRead(notificationId, userId) {
  await db('notifications')
    .where({ id: notificationId, user_id: userId })
    .update({ is_read: true, read_at: new Date() });
}

/**
 * Mark all as read
 */
async function markAllAsRead(userId) {
  await db('notifications')
    .where({ user_id: userId, is_read: false })
    .update({ is_read: true, read_at: new Date() });
}

/**
 * Create notification
 */
async function createNotification(userId, type, title, message, link = null) {
  const [notification] = await db('notifications')
    .insert({ user_id: userId, type, title, message, link })
    .returning('*');
  return notification;
}

module.exports = {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  createNotification,
};
