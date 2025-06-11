const CampaignService = require("@services/campaign.service");
const responseHelper = require("@helper/response");

exports.createCampaign = async (req, res) => {
  try {
    const campaign = await CampaignService.createCampaign(req.body);
    responseHelper.successResponse(
      req,
      res,
      "Campaign created successfully",
      campaign,
      201
    );
  } catch (err) {
    console.error("Create campaign error:", err);
    responseHelper.errorResponse(req, res, err.message, err.statusCode || 500);
  }
};

exports.getCampaigns = async (req, res) => {
  try {
    const { page, limit, status, objective, companyId, search } = req.query;
    const { campaigns, pagination } = await CampaignService.getCampaigns({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      status,
      objective,
      companyId,
      search,
    });
    responseHelper.successResponse(
      req,
      res,
      "Campaigns fetched successfully",
      campaigns,
      200,
      pagination
    );
  } catch (err) {
    console.error("Get campaigns error:", err);
    responseHelper.errorResponse(req, res, err.message, err.statusCode || 500);
  }
};

exports.getCampaignById = async (req, res) => {
  try {
    const { id } = req.params;
    const campaign = await CampaignService.getCampaignById(id);
    if (!campaign) {
      return responseHelper.errorResponse(req, res, "Campaign not found", 404);
    }
    responseHelper.successResponse(
      req,
      res,
      "Campaign fetched successfully",
      campaign
    );
  } catch (err) {
    console.error("Get campaign error:", err);
    responseHelper.errorResponse(req, res, err.message, err.statusCode || 500);
  }
};

exports.updateCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updatedCampaign = await CampaignService.updateCampaign(id, updates);
    responseHelper.successResponse(
      req,
      res,
      "Campaign updated successfully",
      updatedCampaign
    );
  } catch (err) {
    console.error("Update campaign error:", err);
    responseHelper.errorResponse(req, res, err.message, err.statusCode || 500);
  }
};

exports.deleteCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    await CampaignService.deleteCampaign(id);
    responseHelper.successResponse(req, res, "Campaign deleted successfully");
  } catch (err) {
    console.error("Delete campaign error:", err);
    responseHelper.errorResponse(req, res, err.message, err.statusCode || 500);
  }
};

exports.updateCampaignStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updatedInfo = await CampaignService.updateCampaignStatus(id, status);
    responseHelper.successResponse(
      req,
      res,
      `Campaign status updated to ${status}`,
      updatedInfo
    );
  } catch (err) {
    console.error("Update campaign status error:", err);
    responseHelper.errorResponse(req, res, err.message, err.statusCode || 500);
  }
};
