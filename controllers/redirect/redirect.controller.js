const redirectService = require("@services/redirect.service");
const responseHelper = require("@helper/response");

exports.handleRedirect = async (req, res) => {
  try {
    const result = await redirectService.trackClick(req, res);
    return res.redirect(result.redirectUrl);
  } catch (err) {
    console.error("Redirect error:", err);
    const status = err.statusCode || 500;
    return responseHelper.errorResponse(req, res, err.message, status);
  }
};

exports.trackingData = async (req, res) => {
  try {
    const result = await redirectService.getTrackingData(req, res);
    responseHelper.successResponse(
      req,
      res,
      "Tracking Data fetched successfully",
      result
    );
  } catch (err) {
    responseHelper.errorResponse(req, res, err.message, err.statusCode || 500);
  }
};
