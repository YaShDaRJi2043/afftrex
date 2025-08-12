const express = require("express");
const router = express.Router();
const pixelTrackingController = require("@controllers/pixelTracking/pixelTracking.controller");

// Pixel GET route (for image/iframe tracking)
router.get("/:slug", pixelTrackingController.handlePixelGet);

// Pixel POST route (for server_postback/web_sdk tracking)
// router.post("/:slug", pixelTrackingController.handlePixelPost);

module.exports = router;
