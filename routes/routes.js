const router = require("express").Router();

const authRouter = require("@routes/common");
const healthRoutes = require("@routes/health.routes");

router.use("/common", authRouter);
app.use("/check", healthRoutes); // Mount health check under /api

module.exports = router;
