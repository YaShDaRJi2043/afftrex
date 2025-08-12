const router = require("express").Router();

const redirectController = require("@controllers/redirect/redirect.controller");

router.get("/c/:campaignId", redirectController.handleRedirect);

module.exports = router;
