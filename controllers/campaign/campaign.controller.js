const CampaignService = require("@services/campaign.service");
const responseHelper = require("@helper/response");

exports.createCampaign = async (req, res) => {
  try {
    const campaign = await CampaignService.createCampaign(req);
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
    const campaigns = await CampaignService.getCampaigns(req);
    responseHelper.successResponse(
      req,
      res,
      "Campaigns fetched successfully",
      campaigns,
      200
    );
  } catch (err) {
    console.error("Get campaigns error:", err);
    responseHelper.errorResponse(req, res, err.message, err.statusCode || 500);
  }
};

exports.getCampaignById = async (req, res) => {
  try {
    const { id } = req.params;
    const campaign = await CampaignService.getCampaignById(req, id);
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

exports.updateCampaignSettings = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updatedCampaign = await CampaignService.updateCampaignSettings(
      id,
      updates
    );
    responseHelper.successResponse(
      req,
      res,
      "Campaign settings updated successfully",
      updatedCampaign
    );
  } catch (err) {
    console.error("Update campaign settings error:", err);
    responseHelper.errorResponse(req, res, err.message, err.statusCode || 500);
  }
};

exports.updateFallbackFields = async (req, res) => {
  try {
    const { id } = req.params;
    const { fallbackCampaignId, fallbackUrl } = req.body;

    const updatedCampaign = await CampaignService.updateFallbackFields(id, {
      fallbackCampaignId,
      fallbackUrl,
    });

    responseHelper.successResponse(
      req,
      res,
      "Fallback fields updated successfully",
      updatedCampaign
    );
  } catch (err) {
    console.error("Update fallback fields error:", err);
    responseHelper.errorResponse(req, res, err.message, err.statusCode || 500);
  }
};
