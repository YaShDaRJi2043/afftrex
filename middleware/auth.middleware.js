const jwt = require("jsonwebtoken");
const { User, Publisher, Advertiser, Company, Role } = require("@models");
const { secret } = require("@config/config");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authorization token missing." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, secret.JWT_TOKEN_SECRET);
    const { id, role } = decoded;

    let user;

    if (role === "publisher") {
      user = await Publisher.findByPk(id, {
        include: [{ model: Company, as: "company" }],
      });
    } else if (role === "advertiser") {
      user = await Advertiser.findByPk(id, {
        include: [{ model: Company, as: "company" }],
      });
    } else {
      user = await User.findByPk(id, {
        include: ["role", "company"],
      });
    }

    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid token: user not found." });
    }

    req.user = {
      ...user.toJSON(),
      role,
    };

    next();
  } catch (err) {
    console.error("JWT auth error:", err);
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

module.exports = authMiddleware;
