const router = require("express").Router();

const publisherController = require("@controllers/publisher/publisher.controller");
const publisherValidator = require("@controllers/publisher/publisher.validator");

const validate = require("@middleware/validate");
const authMiddleware = require("@middleware/auth.middleware");
const { checkFeature } = require("@middleware/checkFeature");

// =========================
// Public Route (No Token)
// =========================
router.post("/signup", publisherController.signUpPublisher);

// =========================
// Protected Routes (Requires Token)
// =========================
router.use(authMiddleware);

// Routes
router.post(
  "/list",
  checkFeature("publisher_view_all"),
  publisherController.getAllPublishers
);

router.get(
  "/:id",
  checkFeature("publisher_view"),
  publisherController.getPublisherById
);

router.post(
  "/",
  checkFeature("publisher_create"),
  validate(publisherValidator.createPublisherSchema),
  publisherController.createPublisher
);

router.put(
  "/:id",
  checkFeature("publisher_edit"),
  validate(publisherValidator.updatePublisherSchema),
  publisherController.updatePublisher
);

router.delete(
  "/:id",
  checkFeature("publisher_delete"),
  publisherController.deletePublisher
);

router.patch(
  "/:id/status",
  checkFeature("publisher_status_change"),
  validate(publisherValidator.statusChangeSchema),
  publisherController.changePublisherStatus
);

router.get(
  "/:id/campaigns",
  checkFeature("publisher_view_campaigns"),
  publisherController.getCampaignsByPublisherId
);

router.post(
  "/approve",
  checkFeature("publisher_approve_for_campaign"),
  publisherController.approvePublishersForCampaign
);

router.get(
  "/:campaignId/approved-publishers",
  checkFeature("publisher_view_approved"),
  publisherController.getApprovedPublishersForCampaign
);

router.post(
  "/remove-approved",
  checkFeature("publisher_remove_approved"),
  publisherController.removePublisherFromApprovedList
);

// New route for listing users with role 'publisher manager'
router.get(
  "/users/publisher-managers",
  checkFeature("publisher_manager_view"),
  publisherController.listPublisherManagers
);

module.exports = router;
