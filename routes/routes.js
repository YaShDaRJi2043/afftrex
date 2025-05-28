const router = require("express").Router();

const authRouter = require("@routes/common");

router.use("/common", authRouter);

module.exports = router;
