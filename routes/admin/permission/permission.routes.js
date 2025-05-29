const router = require("express").Router();
const permissionController = require("@controllers/permission/permission.controller");
const permissionValidator = require("@controllers/permission/permission.validator");

const validate = require("@middleware/validate");
const { checkFeature } = require("@middleware/checkFeature");
const authMiddleware = require("@middleware/auth.middleware");

// Apply JWT auth to all permission routes
router.use(authMiddleware);

// Routes
router.get(
  "/",
  checkFeature("manage_permissions"),
  permissionController.getAllPermissions
);

router.get(
  "/:id",
  checkFeature("manage_permissions"),
  permissionController.getPermissionById
);

router.post(
  "/",
  checkFeature("manage_permissions"),
  validate(permissionValidator.createSchema),
  permissionController.createPermission
);

router.put(
  "/:id",
  checkFeature("manage_permissions"),
  validate(permissionValidator.updateSchema),
  permissionController.updatePermission
);

router.delete(
  "/:id",
  checkFeature("manage_permissions"),
  permissionController.deletePermission
);

module.exports = router;
