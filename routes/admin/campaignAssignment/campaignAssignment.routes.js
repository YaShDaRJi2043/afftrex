const router = require("express").Router();

const campaignAssignmentController = require("@controllers/campaignAssignment/campaignAssignment.controller");
const campaignAssignmentValidator = require("@controllers/campaignAssignment/campaignAssignment.validator");

const validate = require("@middleware/validate");
const authMiddleware = require("@middleware/auth.middleware");
const { checkFeature } = require("@middleware/checkFeature");

router.use(authMiddleware);

router.post(
  "/assign",
  checkFeature("campaign_assign"),
  validate(campaignAssignmentValidator.assignCampaignValidator),
  campaignAssignmentController.assignCampaign
);

module.exports = router;
