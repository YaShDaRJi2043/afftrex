const router = require("express").Router();

const authRouter = require("@routes/common/auth/auth.routes");
const publisherRouter = require("@routes/common/publisher/publisher.routes");
const advertiserRouter = require("@routes/common/advertiser/advertiser.routes");

router.use("/auth", authRouter);
router.use("/publisher", publisherRouter);
router.use("/advertiser", advertiserRouter);

module.exports = router;
