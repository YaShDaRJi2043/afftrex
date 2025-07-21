const publisherService = require("@services/publisher.service");
const responseHelper = require("@helper/response");

exports.createPublisher = async (req, res) => {
  try {
    const result = await publisherService.createPublisher(req);
    responseHelper.successResponse(
      req,
      res,
      "Publisher created successfully",
      result
    );
  } catch (err) {
    responseHelper.errorResponse(req, res, err.message, err.statusCode || 500);
  }
};

exports.getAllPublishers = async (req, res) => {
  try {
    const result = await publisherService.getAllPublishers(req);
    responseHelper.successResponse(
      req,
      res,
      "Publishers fetched successfully",
      result
    );
  } catch (err) {
    responseHelper.errorResponse(req, res, err.message, err.statusCode || 500);
  }
};

exports.getPublisherById = async (req, res) => {
  try {
    const result = await publisherService.getPublisherById(req);
    responseHelper.successResponse(
      req,
      res,
      "Publisher fetched successfully",
      result
    );
  } catch (err) {
    responseHelper.errorResponse(req, res, err.message, err.statusCode || 500);
  }
};

exports.updatePublisher = async (req, res) => {
  try {
    const result = await publisherService.updatePublisher(req);
    responseHelper.successResponse(
      req,
      res,
      "Publisher updated successfully",
      result
    );
  } catch (err) {
    responseHelper.errorResponse(req, res, err.message, err.statusCode || 500);
  }
};

exports.deletePublisher = async (req, res) => {
  try {
    const result = await publisherService.deletePublisher(req);
    responseHelper.successResponse(
      req,
      res,
      "Publisher deleted successfully",
      result
    );
  } catch (err) {
    responseHelper.errorResponse(req, res, err.message, err.statusCode || 500);
  }
};

exports.changePublisherStatus = async (req, res) => {
  try {
    const result = await publisherService.changePublisherStatus(req);
    responseHelper.successResponse(
      req,
      res,
      "Publisher status updated",
      result
    );
  } catch (err) {
    responseHelper.errorResponse(req, res, err.message, err.statusCode || 500);
  }
};

exports.getCampaignsByPublisherId = async (req, res) => {
  try {
    const result = await publisherService.campaignsByPublisherId(req);
    responseHelper.successResponse(
      req,
      res,
      "Campaigns fetched successfully",
      result
    );
  } catch (err) {
    responseHelper.errorResponse(req, res, err.message, err.statusCode || 500);
  }
};
