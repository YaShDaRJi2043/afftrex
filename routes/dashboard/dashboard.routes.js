const router = require("express").Router();
const auth = require("@middleware/auth.middleware");
const controller = require("@controllers/dashboard/dashboard.controller");

// Apply JWT to dashboard
router.use(auth);

// GET /api/dashboard?companyId=123&from=2025-08-21&to=2025-08-27
router.get("/", controller.getDashboard);

module.exports = router;
