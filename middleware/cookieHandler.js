const { v4: uuidv4 } = require("uuid");

module.exports = (req, res, next) => {
  try {
    // Check if cookie exists
    let clickId = req.cookies?.clickId;

    // If not, create a new one
    if (!clickId) {
      clickId = uuidv4();
      const isSecure =
        req.secure ||
        (req.get("x-forwarded-proto") || "").split(",")[0].trim() === "https";

      res.cookie("clickId", clickId, {
        httpOnly: false, // Allow JS access if needed
        secure: isSecure, // Send only over HTTPS
        sameSite: "None", // Allow cross-site cookies
        maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
        path: "/",
      });
    }

    // Store clickId in request for later use
    req.clickId = clickId;
    next();
  } catch (error) {
    console.error("Cookie creation error:", error);
    next(error);
  }
};
