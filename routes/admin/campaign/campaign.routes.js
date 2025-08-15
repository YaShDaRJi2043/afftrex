const router = require("express").Router();

const campaignController = require("@controllers/campaign/campaign.controller");
const campaignValidator = require("@controllers/campaign/campaign.validator");

const { checkFeature } = require("@middleware/checkFeature");
const upload = require("@middleware/multer");
const validate = require("@middleware/validate");
const authMiddleware = require("@root/middleware/auth.middleware");

// Apply JWT auth to all routes in this router
router.use(authMiddleware);

router.post(
  "/",
  upload.single("thumbnail"),
  checkFeature("campaign_create"),
  validate(campaignValidator.createCampaignValidator),
  campaignController.createCampaign
);

router.post("/list", campaignController.getCampaigns);

router.get(
  "/:id",
  validate(campaignValidator.getCampaignValidator),
  campaignController.getCampaignById
);

router.put(
  "/:id",
  checkFeature("campaign_edit"),
  validate(campaignValidator.updateCampaignValidator),
  campaignController.updateCampaign
);

router.patch(
  "/:id/status",
  checkFeature("campaign_status_update"),
  validate(campaignValidator.updateStatusValidator),
  campaignController.updateCampaignStatus
);

router.delete(
  "/:id",
  checkFeature("campaign_delete"),
  validate(campaignValidator.getCampaignValidator),
  campaignController.deleteCampaign
);

router.put(
  "/update-tracking-script/:id",
  checkFeature("campaign_update_tracking_script"),
  campaignController.updateTrackingScriptParams
);

module.exports = router;
