const router = require("express").Router();

const campaignController = require("@controllers/campaign/campaign.controller");
// const {
//   createCampaignValidator,
//   updateCampaignValidator,
//   getCampaignValidator,
//   getCampaignsValidator,
//   updateStatusValidator,
// } = require("@controllers/campaign/campaign.validator");

const campaignValidator = require("@controllers/campaign/campaign.validator");

const { checkFeature } = require("@middleware/checkFeature");
const upload = require("@middleware/multer");
const validate = require("@middleware/validate");

router.post(
  "/",
  upload.single("thumbnail"),
  checkFeature("review_campaigns"),
  validate(campaignValidator.createCampaignValidator),
  campaignController.createCampaign
);

router.get(
  "/",
  validate(campaignValidator.getCampaignsValidator),
  campaignController.getCampaigns
);

router.get(
  "/:id",
  validate(campaignValidator.getCampaignValidator),
  campaignController.getCampaignById
);

router.put(
  "/:id",
  checkFeature("review_campaigns"),
  validate(campaignValidator.updateCampaignValidator),
  campaignController.updateCampaign
);

router.patch(
  "/:id/status",
  checkFeature("review_campaigns"),
  validate(campaignValidator.updateStatusValidator),
  campaignController.updateCampaignStatus
);

router.delete(
  "/:id",
  checkFeature("review_campaigns"),
  validate(campaignValidator.getCampaignValidator),
  campaignController.deleteCampaign
);

module.exports = router;
