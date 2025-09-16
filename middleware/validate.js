const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message, // ✅ only first message
      });
    }

    next();
  };
};

module.exports = validate;
