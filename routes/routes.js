const router = require("express").Router();

const healthRoutes = require("@routes/health.routes");
const adminRouter = require("@routes/admin");
const commonRouter = require("@routes/common");
const dashboardRouter = require("@routes/dashboard/dashboard.routes");

router.use("/check", healthRoutes);
router.use("/admin", adminRouter);
router.use("/common", commonRouter);
router.use("/dashboard", dashboardRouter);

module.exports = router;
