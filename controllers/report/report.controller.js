const reportService = require("@services/report.service");
const responseHelper = require("@helper/response"); // Match naming with example

exports.getPixelTrackingReport = async (req, res) => {
  try {
    const result = await reportService.getPixelTrackingReport(req.query);
    responseHelper.successResponse(
      req,
      res,
      "Pixel Tracking Report fetched successfully",
      result
    );
  } catch (err) {
    responseHelper.errorResponse(
      req,
      res,
      err.message || "Failed to get pixel tracking report",
      err.statusCode || 500
    );
  }
};
