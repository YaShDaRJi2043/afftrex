const router = require("express").Router();

const healthRoutes = require("@routes/health.routes");
const adminRouter = require("@routes/admin");
const commonRouter = require("@routes/common");

router.use("/check", healthRoutes);
router.use("/admin", adminRouter);
router.use("/common", commonRouter);

module.exports = router;
