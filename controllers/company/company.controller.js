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

exports.listCompany = async (req, res) => {
  try {
    const result = await CompanyService.list(req);
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

exports.extendSubscriptionCompany = async (req, res) => {
  try {
    const result = await CompanyService.extendSubscription(req);
    responseHelper.successResponse(
      req,
      res,
      "Company Subscription extended",
      result
    );
  } catch (err) {
    responseHelper.errorResponse(req, res, err.message, err.statusCode || 500);
  }
};

exports.sendSubscriptionReminderCompany = async (req, res) => {
  try {
    const result = await CompanyService.sendSubscriptionReminder(req);
    responseHelper.successResponse(
      req,
      res,
      "Company Subscription extended",
      result
    );
  } catch (err) {
    responseHelper.errorResponse(req, res, err.message, err.statusCode || 500);
  }
};

exports.createUser = async (req, res) => {
  try {
    const result = await CompanyService.createUser(req);
    responseHelper.successResponse(
      req,
      res,
      "User created successfully",
      result
    );
  } catch (err) {
    responseHelper.errorResponse(req, res, err.message, err.statusCode || 500);
  }
};

exports.listCompanyUsers = async (req, res) => {
  try {
    const result = await CompanyService.listCompanyUsers(req);
    responseHelper.successResponse(
      req,
      res,
      "Company users fetched successfully",
      result
    );
  } catch (err) {
    responseHelper.errorResponse(req, res, err.message, err.statusCode || 500);
  }
};
