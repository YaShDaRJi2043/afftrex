const advertiserService = require("@services/advertiser.service");
const responseHelper = require("@helper/response");

exports.createAdvertiser = async (req, res) => {
  try {
    const result = await advertiserService.createAdvertiser(req);
    responseHelper.successResponse(
      req,
      res,
      "Advertiser created successfully",
      result
    );
  } catch (err) {
    responseHelper.errorResponse(req, res, err.message, err.statusCode || 500);
  }
};

exports.getAllAdvertisers = async (req, res) => {
  try {
    const result = await advertiserService.getAllAdvertisers(req);
    responseHelper.successResponse(
      req,
      res,
      "Advertisers fetched successfully",
      result
    );
  } catch (err) {
    responseHelper.errorResponse(req, res, err.message, err.statusCode || 500);
  }
};

exports.getAdvertiserById = async (req, res) => {
  try {
    const result = await advertiserService.getAdvertiserById(req);
    responseHelper.successResponse(
      req,
      res,
      "Advertiser fetched successfully",
      result
    );
  } catch (err) {
    responseHelper.errorResponse(req, res, err.message, err.statusCode || 500);
  }
};

exports.updateAdvertiser = async (req, res) => {
  try {
    const result = await advertiserService.updateAdvertiser(req);
    responseHelper.successResponse(
      req,
      res,
      "Advertiser updated successfully",
      result
    );
  } catch (err) {
    responseHelper.errorResponse(req, res, err.message, err.statusCode || 500);
  }
};

exports.deleteAdvertiser = async (req, res) => {
  try {
    const result = await advertiserService.deleteAdvertiser(req);
    responseHelper.successResponse(
      req,
      res,
      "Advertiser deleted successfully",
      result
    );
  } catch (err) {
    responseHelper.errorResponse(req, res, err.message, err.statusCode || 500);
  }
};

exports.changeAdvertiserStatus = async (req, res) => {
  try {
    const result = await advertiserService.changeAdvertiserStatus(req);
    responseHelper.successResponse(
      req,
      res,
      "Advertiser status updated successfully",
      result
    );
  } catch (err) {
    responseHelper.errorResponse(req, res, err.message, err.statusCode || 500);
  }
};

exports.signUpAdvertiser = async (req, res) => {
  try {
    const result = await advertiserService.signUpAdvertiser(req);
    responseHelper.successResponse(
      req,
      res,
      "Advertiser signed up successfully",
      result
    );
  } catch (err) {
    responseHelper.errorResponse(req, res, err.message, err.statusCode || 500);
  }
};
