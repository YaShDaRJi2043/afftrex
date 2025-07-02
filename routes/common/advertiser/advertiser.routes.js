const router = require("express").Router();

const advertiserController = require("@controllers/advertiser/advertiser.controller");
const advertiserValidator = require("@controllers/advertiser/advertiser.validation");

const validate = require("@middleware/validate");
const authMiddleware = require("@middleware/auth.middleware");
const { checkFeature } = require("@middleware/checkFeature");

// Apply JWT auth to all advertiser routes
router.use(authMiddleware);

// Routes
router.post(
  "/list",
  checkFeature("manage_advertisers"),
  advertiserController.getAllAdvertisers
);

router.get(
  "/:id",
  checkFeature("manage_advertisers"),
  advertiserController.getAdvertiserById
);

router.post(
  "/",
  checkFeature("manage_advertisers"),
  validate(advertiserValidator.createAdvertiserSchema),
  advertiserController.createAdvertiser
);

router.put(
  "/:id",
  checkFeature("manage_advertisers"),
  validate(advertiserValidator.updateAdvertiserSchema),
  advertiserController.updateAdvertiser
);

router.delete(
  "/:id",
  checkFeature("manage_advertisers"),
  advertiserController.deleteAdvertiser
);

router.patch(
  "/:id/status",
  checkFeature("manage_advertisers"),
  advertiserController.changeAdvertiserStatus
);

module.exports = router;
