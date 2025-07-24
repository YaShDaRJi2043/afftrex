const CampaignAssignmentService = require("@services/campaignAssignment.service");
const responseHelper = require("@helper/response");

exports.assignCampaign = async (req, res) => {
  try {
    const { campaignId, publisherIds, p1, p2, p3, p4 } = req.body;

    if (
      !campaignId ||
      !Array.isArray(publisherIds) ||
      publisherIds.length === 0
    ) {
      return responseHelper.errorResponse(
        req,
        res,
        "Campaign ID and publisher IDs are required",
        400
      );
    }

    const assignments =
      await CampaignAssignmentService.assignCampaignToPublishers({
        campaignId,
        publisherIds,
        p1,
        p2,
        p3,
        p4,
      });

    return responseHelper.successResponse(
      req,
      res,
      "Campaign assigned successfully",
      assignments,
      201
    );
  } catch (err) {
    console.error("Assign Campaign Error:", err);
    return responseHelper.errorResponse(
      req,
      res,
      err.message || "Internal Server Error",
      err.statusCode || 500
    );
  }
};
