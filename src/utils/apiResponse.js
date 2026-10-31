/**
 * Standard API Response helpers
 */
const sendSuccess = (res, message = 'Success', data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

const sendError = (res, message = 'An error occurred', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

const sendPaginated = (res, message = 'Success', items = [], pagination = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data: items,
    pagination: {
      total: pagination.total || items.length,
      page: pagination.page || 1,
      limit: pagination.limit || items.length,
      totalPages: pagination.totalPages || 1
    }
  });
};

module.exports = {
  sendSuccess,
  sendError,
  sendPaginated
};
