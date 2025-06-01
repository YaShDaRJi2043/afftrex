const CompanyService = require("@services/company.service");
const responseHelper = require("@helper/response");

exports.LoginInfoCompany = async (req, res) => {
  try {
    const result = await CompanyService.LoginInfo(req);
    responseHelper.successResponse(
      req,
      res,
      "Company Info fetched successfully",
      result
    );
  } catch (err) {
    responseHelper.errorResponse(req, res, err.message, err.statusCode || 500);
  }
};

exports.registerCompany = async (req, res) => {
  try {
    const result = await CompanyService.register(req);
    responseHelper.successResponse(
      req,
      res,
      "Company registration submitted",
      result
    );
  } catch (err) {
    responseHelper.errorResponse(req, res, err.message, err.statusCode || 500);
  }
};

exports.approveCompany = async (req, res) => {
  try {
    const result = await CompanyService.approve(req);
    responseHelper.successResponse(
      req,
      res,
      "Company registration submitted",
      result
    );
  } catch (err) {
    responseHelper.errorResponse(req, res, err.message, err.statusCode || 500);
  }
};
