const DashboardService = require("@services/dashboard.service");
const responseHelper = require("@helper/response");

exports.getDashboard = async (req, res) => {
  try {
    const { from, to } = req.query;
    const { company_id } = req.user;
    const data = await DashboardService.getDashboard({ company_id, from, to });
    responseHelper.successResponse(req, res, "Dashboard loaded", data);
  } catch (err) {
    responseHelper.errorResponse(req, res, err.message, err.statusCode || 500);
  }
};
