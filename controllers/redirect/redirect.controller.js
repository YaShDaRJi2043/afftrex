const redirectService = require("@services/redirect.service");
const responseHelper = require("@helper/response");

exports.handleRedirect = async (req, res) => {
  try {
    // Ensure response hasn't been sent already
    if (res.headersSent) return;

    const result = await redirectService.trackClick(req, res);

    // Check again after service call
    if (res.headersSent) return;

    if (result?.redirectUrl) {
      // Log for debugging
      console.log(`🍪 Cookie set for click_id: ${result.clickId}`);
      console.log(`🔄 Redirecting to: ${result.redirectUrl}`);

      return res.redirect(302, result.redirectUrl);
    }

    // If no redirect URL, send a default response
    return res.status(400).json({
      success: false,
      message: "No redirect URL provided",
    });
  } catch (err) {
    console.error("Redirect error:", err);

    // Don't try to send response if headers already sent
    if (res.headersSent) return;

    const status = err.statusCode || 500;
    return responseHelper.errorResponse(req, res, err.message, status);
  }
};
