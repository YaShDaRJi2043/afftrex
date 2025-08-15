const router = require("express").Router();

const userController = require("@controllers/user/user.controller");
const authMiddleware = require("@middleware/auth.middleware");
const { checkFeature } = require("@middleware/checkFeature");

// Apply JWT auth to all routes in this router
router.use(authMiddleware);

router.post(
  "/createEmployee",
  checkFeature("user_create_employee"),
  userController.createUser
);

router.get(
  "/company-users",
  checkFeature("user_view_all"),
  userController.listCompanyUsers
);

router.get(
  "/:id",
  checkFeature("user_view"),
  userController.listCompanyUsersById
);

router.put(
  "/:id",
  checkFeature("user_edit"),
  userController.updateCompanyUsers
);

router.delete(
  "/:id",
  checkFeature("user_delete"),
  userController.deleteCompanyUsers
);

router.put(
  "/:id/status",
  checkFeature("user_status_change"),
  userController.statusChangeCompanyUsers
);

module.exports = router;
