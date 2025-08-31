const DashboardService = require("@services/dashboard.service");
const responseHelper = require("@helper/response");

exports.getDashboard = async (req, res) => {
  try {
    const { companyId, from, to } = req.query;
    const data = await DashboardService.getDashboard({ companyId, from, to });
    responseHelper.successResponse(req, res, "Dashboard loaded", data);
  } catch (err) {
    responseHelper.errorResponse(req, res, err.message, err.statusCode || 500);
  }
};
