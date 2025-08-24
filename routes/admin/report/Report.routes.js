const router = require("express").Router();

const trackingController = require("@controllers/report/report.controller");
const authMiddleware = require("@middleware/auth.middleware");
const { checkFeature } = require("@middleware/checkFeature");

// Apply JWT auth to all routes
router.use(authMiddleware);

router.get(
  "/campaign-trackings",
  checkFeature("report_view_campaign_tracking"),
  trackingController.getCampaignTrackingByCampaignId
);

router.get(
  "/conversion-trackings",
  checkFeature("report_view_conversion_tracking"),
  trackingController.getPixelTrackingByTrackingId
);

module.exports = router;
