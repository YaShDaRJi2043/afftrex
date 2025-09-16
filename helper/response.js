exports.successResponse = (req, res, message, data = {}) => {
  return res.status(200).json({
    success: true,
    message,
    data,
  });
};

exports.errorResponse = (req, res, error, statusCode = 500) => {
  let message = error;

  // Handle Sequelize validation & unique errors
  if (error && (error.name === "SequelizeValidationError" || error.name === "SequelizeUniqueConstraintError")) {
    if (error.errors && error.errors.length > 0) {
      message = error.errors[0].message; // only return first error message
      statusCode = 400;
    }
  }

  return res.status(statusCode).json({
    success: false,
    message,
  });
};

