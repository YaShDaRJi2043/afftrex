const redirectService = require("@services/redirect.service");
const responseHelper = require("@helper/response");

exports.handleRedirect = async (req, res) => {
  try {
    const result = await redirectService.trackClick(req, res);
    if (res.headersSent) return; // service already replied (e.g., error)
    if (result?.redirectUrl) {
      return res.redirect(302, result.redirectUrl);
    }
    return; // nothing to do
  } catch (err) {
    console.error("Redirect error:", err);
    const status = err.statusCode || 500;
    return responseHelper.errorResponse(req, res, err.message, status);
  }
};
