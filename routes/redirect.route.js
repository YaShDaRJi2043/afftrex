const router = require("express").Router();
const redirectController = require("@controllers/redirect/redirect.controller");
const cookieHandler = require("@middleware/cookieHandler");

router.get("/c/:campaignId", redirectController.handleRedirect);

module.exports = router;
