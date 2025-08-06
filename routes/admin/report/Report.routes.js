const router = require("express").Router();
const reportController = require("@controllers/report/report.controller");

const authMiddleware = require("@middleware/auth.middleware"); // path aligned with example

// Apply JWT auth to all report routes
router.use(authMiddleware);

// Routes
router.get("/", reportController.getPixelTrackingReport);

module.exports = router;
