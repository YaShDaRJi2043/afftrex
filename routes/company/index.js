const router = require("express").Router();

const authRouter = require("@routes/company/auth/auth.route");

router.use("/auth", authRouter);

module.exports = router;
