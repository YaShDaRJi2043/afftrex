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
  checkFeature("advertiser_view_all"),
  advertiserController.getAllAdvertisers
);

router.get(
  "/:id",
  checkFeature("advertiser_view"),
  advertiserController.getAdvertiserById
);

router.post(
  "/",
  checkFeature("advertiser_create"),
  validate(advertiserValidator.createAdvertiserSchema),
  advertiserController.createAdvertiser
);

router.put(
  "/:id",
  checkFeature("advertiser_edit"),
  validate(advertiserValidator.updateAdvertiserSchema),
  advertiserController.updateAdvertiser
);

router.delete(
  "/:id",
  checkFeature("advertiser_delete"),
  advertiserController.deleteAdvertiser
);

router.patch(
  "/:id/status",
  checkFeature("advertiser_status_change"),
  advertiserController.changeAdvertiserStatus
);

module.exports = router;
