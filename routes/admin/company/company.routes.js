const router = require("express").Router();

const companyController = require("@controllers/company/company.controller");
const authMiddleware = require("@middleware/auth.middleware");
const { checkFeature } = require("@middleware/checkFeature");

// Apply JWT auth to all routes in this router
router.use(authMiddleware);

router.put(
  "/approve/:id",
  checkFeature("company_approve"),
  companyController.approveCompany
);

router.put(
  "/reject/:id",
  checkFeature("company_reject"),
  companyController.rejectCompany
);

router.get(
  "/list",
  checkFeature("company_list"),
  companyController.listCompany
);

router.put(
  "/:id/extend-subscription",
  checkFeature("company_extend_subscription"),
  companyController.extendSubscriptionCompany
);

router.put(
  "/:id/send-subscription-reminder",
  checkFeature("company_send_subscription_reminder"),
  companyController.sendSubscriptionReminderCompany
);

module.exports = router;
