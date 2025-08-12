// @middleware/cookieHandler.js
const { v4: uuidv4 } = require("uuid");

module.exports = (req, res, next) => {
  try {
    // Requires cookie-parser earlier in app: app.use(cookieParser());
    let clickId = req.cookies?.clickId;

    if (!clickId) {
      clickId = uuidv4();

      const isSecure =
        req.secure ||
        (req.get("x-forwarded-proto") || "").split(",")[0].trim() === "https";

      res.cookie("clickId", clickId, {
        domain: ".afftrex.org", // share across afftrex subdomains
        httpOnly: false, // if you want client-side JS (iframe JS) to read it; change to true for more security
        secure: isSecure, // required if SameSite=None
        sameSite: "None", // allow cross-site usage (iframe / merchant page)
        path: "/",
        maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
      });
    }

    // Attach for downstream usage
    req.clickId = clickId;
    next();
  } catch (err) {
    console.error("cookieHandler error:", err);
    // allow request to continue even if cookie set fails
    next();
  }
};
