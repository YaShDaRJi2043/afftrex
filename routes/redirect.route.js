const router = require("express").Router();

const redirectController = require("@controllers/redirect/redirect.controller");

router.get("/c/:campaignId", redirectController.handleRedirect);
router.get("/campaign-tracking", redirectController.trackingData);

module.exports = router;
