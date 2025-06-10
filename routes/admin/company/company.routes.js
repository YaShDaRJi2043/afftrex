const router = require("express").Router();

const companyController = require("@controllers/company/company.controller");
const authMiddleware = require("@middleware/auth.middleware");
const { checkFeature } = require("@middleware/checkFeature");

// Apply JWT auth to all routes in this router
router.use(authMiddleware);

router.put(
  "/approve/:id",
  checkFeature("manage_company"),
  companyController.approveCompany
);

router.put(
  "/reject/:id",
  checkFeature("manage_company"),
  companyController.rejectCompany
);

router.get(
  "/list",
  checkFeature("manage_company"),
  companyController.listCompany
);

router.put(
  "/:id/extend-subscription",
  checkFeature("manage_company"),
  companyController.extendSubscriptionCompany
);

router.put(
  "/:id/send-subscription-reminder",
  checkFeature("manage_company"),
  companyController.sendSubscriptionReminderCompany
);

module.exports = router;
