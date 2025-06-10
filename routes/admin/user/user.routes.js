const router = require("express").Router();

const userController = require("@controllers/user/user.controller");
const authMiddleware = require("@middleware/auth.middleware");
const { checkFeature } = require("@middleware/checkFeature");

// Apply JWT auth to all routes in this router
router.use(authMiddleware);

router.post(
  "/createEmployee",
  checkFeature("manage_users"),
  userController.createUser
);

router.get(
  "/company-users",
  checkFeature("manage_users"),
  userController.listCompanyUsers
);

router.get(
  "/:id",
  checkFeature("manage_users"),
  userController.listCompanyUsersById
);

router.put(
  "/:id",
  checkFeature("manage_users"),
  userController.updateCompanyUsers
);

router.delete(
  "/:id",
  checkFeature("manage_users"),
  userController.deleteCompanyUsers
);

router.put(
  "/:id/status",
  checkFeature("manage_users"),
  userController.statusChangeCompanyUsers
);

module.exports = router;
