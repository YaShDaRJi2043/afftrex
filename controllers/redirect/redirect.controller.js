const redirectService = require("@services/redirect.service");
const responseHelper = require("@helper/response");

exports.handleRedirect = async (req, res) => {
  try {
    const result = await redirectService.trackClick(req, res);
    if (res.headersSent) return;

    if (result?.redirectUrl) {
      return res.render("storeClickId", {
        clickId: result.clickId, // Pass clickId to the view
        redirectUrl: result.redirectUrl, // Ensure this value is correct
      });
    }

    return;
  } catch (err) {
    console.error("Redirect error:", err);
    const status = err.statusCode || 500;
    return responseHelper.errorResponse(req, res, err.message, status);
  }
};
