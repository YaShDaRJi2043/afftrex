const express = require("express");
const router = express.Router();
const pixelTrackingController = require("@controllers/pixelTracking/pixelTracking.controller");

// Pixel GET route (for image/iframe tracking)
router.get("/pixel/:slug", pixelTrackingController.handlePixelGet);

// Postback GET route (advertisers usually send GET requests for postback)
router.get("/postback/:slug", pixelTrackingController.handlePostback);

module.exports = router;
