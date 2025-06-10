const userService = require("@services/user.service");
const responseHelper = require("@helper/response");

exports.createUser = async (req, res) => {
  try {
    const result = await userService.createUser(req);
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
    const result = await userService.listCompanyUsers(req);
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

exports.listCompanyUsersById = async (req, res) => {
  try {
    const result = await userService.getUserById(req);
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

exports.updateCompanyUsers = async (req, res) => {
  try {
    const result = await userService.updateUser(req);
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

exports.deleteCompanyUsers = async (req, res) => {
  try {
    const result = await userService.deleteUser(req);
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

exports.statusChangeCompanyUsers = async (req, res) => {
  try {
    const result = await userService.changeUserStatus(req);
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
