const success = (data, message = 'Success', meta = {}) => ({
  success: true,
  data,
  message,
  ...meta,
});

const error = (message, code = 500, details = null) => ({
  success: false,
  error: message,
  code,
  ...(details && { details }),
  timestamp: new Date().toISOString(),
});

const paginated = (data, page, limit, total) => ({
  success: true,
  data,
  pagination: {
    page: parseInt(page),
    limit: parseInt(limit),
    total: parseInt(total),
    pages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrev: page > 1,
  },
});

module.exports = {
  success,
  error,
  paginated,
};
