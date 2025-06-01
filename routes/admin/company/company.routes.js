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

module.exports = router;
