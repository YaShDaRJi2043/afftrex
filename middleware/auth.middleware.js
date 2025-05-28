const { verifyToken } = require("@utils/token");
const { errorResponse } = require("@helper/response");

exports.authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return errorResponse(res, "Authentication token missing", 401);
  }

  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return errorResponse(res, "Invalid or expired token", 401);
  }

  // Attach decoded user to request
  req.user = decoded;
  next();
};
