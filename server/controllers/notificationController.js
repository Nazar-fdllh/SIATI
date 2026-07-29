const notificationService = require('../services/notificationService');
const response = require('../utils/response');
const { parsePagination } = require('../utils/pagination');

/**
 * GET /notifications
 */
async function getMyNotifications(req, res, next) {
  try {
    const { page, limit } = parsePagination(req.query);
    const { unreadOnly } = req.query;

    const result = await notificationService.getUserNotifications(req.user.id, {
      page,
      limit,
      unreadOnly: unreadOnly === 'true',
    });

    // Custom response format for notifications to include unread_count easily
    return res.status(200).json({
        success: true,
        data: result.data,
        meta: {
            ...result.meta,
            unread_count: result.unread_count
        }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /notifications/:id/read
 */
async function markAsRead(req, res, next) {
  try {
    const { id } = req.params;
    await notificationService.markAsRead(id, req.user.id);
    return response.success(res, null, 'Notifikasi telah dibaca');
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /notifications/read-all
 */
async function markAllAsRead(req, res, next) {
  try {
    await notificationService.markAllAsRead(req.user.id);
    return response.success(res, null, 'Semua notifikasi telah dibaca');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
};
