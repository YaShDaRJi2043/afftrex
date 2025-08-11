const router = require("express").Router();

const redirectController = require("@controllers/redirect/redirect.controller");
const cookieHandler = require("@middleware/cookieHandler");
const { redirectWithCookie } = require("@services/redirect.service");

router.get("/c/:campaignId", cookieHandler, redirectController.handleRedirect);
router.get("/redirect-with-cookie", redirectWithCookie); // Added route for redirectWithCookie

module.exports = router;
