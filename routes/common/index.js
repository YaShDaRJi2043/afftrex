const router = require("express").Router();

const authRouter = require("@routes/common/auth/auth.routes");

router.use("/auth", authRouter);

module.exports = router;
