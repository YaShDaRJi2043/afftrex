const TrackingService = require("@services/report.service");
const responseHelper = require("@helper/response");

exports.getCampaignTrackingByCampaignId = async (req, res) => {
  try {
    const result = await TrackingService.getCampaignTrackingByCampaignId(req);
    responseHelper.successResponse(
      req,
      res,
      "Campaign tracking records fetched successfully",
      result
    );
  } catch (err) {
    responseHelper.errorResponse(req, res, err.message, err.statusCode || 500);
  }
};

exports.getPixelTrackingByTrackingId = async (req, res) => {
  try {
    const result = await TrackingService.getPixelTrackingByTrackingId(req);
    responseHelper.successResponse(
      req,
      res,
      "Conversion tracking records fetched successfully",
      result
    );
  } catch (err) {
    responseHelper.errorResponse(req, res, err.message, err.statusCode || 500);
  }
};

exports.getMainReport = async (req, res) => {
  try {
    const result = await TrackingService.getMainReport(req);

    // Flatten response (do not nest under "data")
    res.status(200).json({
      success: true,
      message: "Main report fetched successfully",
      ...result,
    });
  } catch (err) {
    responseHelper.errorResponse(req, res, err.message, err.statusCode || 500);
  }
};
