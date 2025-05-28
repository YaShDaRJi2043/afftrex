exports.successResponse = (req, res, message, data = {}) => {
  return res.status(200).json({
    success: true,
    message,
    data,
  });
};

exports.errorResponse = (req, res, message, statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};
