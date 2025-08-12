const { v4: uuidv4 } = require("uuid");

module.exports = (req, res, next) => {
  try {
    // Check if cookie exists
    let clickId = req.cookies?.click_id;

    // If not, create a new one
    if (!clickId) {
      clickId = uuidv4();
      res.cookie("click_id", clickId, {
        httpOnly: true, // Prevent JS access
        secure: true, // Send only over HTTPS
        sameSite: "None", // Allow cross-site redirect cookie
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });
    }

    // Store click_id in request for later use
    req.clickId = clickId;
    next();
  } catch (error) {
    next(error);
  }
};
