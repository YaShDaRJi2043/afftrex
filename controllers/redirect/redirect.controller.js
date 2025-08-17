const redirectService = require("@services/redirect.service");
const responseHelper = require("@helper/response");

exports.handleRedirect = async (req, res) => {
  try {
    const result = await redirectService.trackClick(req, res);
    if (res.headersSent) return;

    if (result?.redirectUrl) {
      // Set the cookie before redirecting
      res.cookie("click_id", result.clickId, {
        domain: "api.afftrex.org",
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "none",
      });

      // Redirect to the target URL
      return res.redirect(302, result.redirectUrl);
    }
    return;
  } catch (err) {
    console.error("Redirect error:", err);
    const status = err.statusCode || 500;
    return responseHelper.errorResponse(req, res, err.message, status);
  }
};
