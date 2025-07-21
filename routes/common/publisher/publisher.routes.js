const router = require("express").Router();

const publisherController = require("@controllers/publisher/publisher.controller");
const publisherValidator = require("@controllers/publisher/publisher.validator");

const validate = require("@middleware/validate");
const authMiddleware = require("@middleware/auth.middleware");
const { checkFeature } = require("@middleware/checkFeature");

// Apply JWT auth to all publisher routes
router.use(authMiddleware);

// Routes
router.post(
  "/list",
  checkFeature("manage_publishers"),
  publisherController.getAllPublishers
);

router.get(
  "/:id",
  checkFeature("manage_publishers"),
  publisherController.getPublisherById
);

router.post(
  "/",
  checkFeature("manage_publishers"),
  validate(publisherValidator.createPublisherSchema),
  publisherController.createPublisher
);

router.put(
  "/:id",
  checkFeature("manage_publishers"),
  validate(publisherValidator.updatePublisherSchema),
  publisherController.updatePublisher
);

router.delete(
  "/:id",
  checkFeature("manage_publishers"),
  publisherController.deletePublisher
);

router.patch(
  "/:id/status",
  checkFeature("manage_publishers"),
  validate(publisherValidator.statusChangeSchema),
  publisherController.changePublisherStatus
);

router.get(
  "/:id/campaigns",
  checkFeature("manage_publishers"),
  publisherController.getCampaignsByPublisherId
);

module.exports = router;
