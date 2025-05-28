const jwt = require("jsonwebtoken");

const { secret } = require("@config/config");

const JWT_SECRET = secret.JWT_TOKEN_SECRET;
const JWT_EXPIRY = secret.JWT_TOKEN_EXPIRY;

exports.generateToken = (payload, expiresIn = JWT_EXPIRY) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

exports.verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
};
