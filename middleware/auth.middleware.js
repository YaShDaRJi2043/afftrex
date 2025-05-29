const jwt = require("jsonwebtoken");
const { User, Role } = require("@models"); // or adjust path
const { secret } = require("@config/config");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authorization token missing." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, secret.JWT_TOKEN_SECRET);

    const user = await User.findByPk(decoded.id, { include: ["role"] });
    console.log(user);

    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid token: user not found." });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("JWT auth error:", err);
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

module.exports = authMiddleware;
