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
  checkFeature("permission_view_all"),
  permissionController.getAllPermissions
);

router.get(
  "/:id",
  checkFeature("permission_view"),
  permissionController.getPermissionById
);

router.post(
  "/",
  checkFeature("permission_create"),
  validate(permissionValidator.createSchema),
  permissionController.createPermission
);

router.put(
  "/:id",
  checkFeature("permission_edit"),
  validate(permissionValidator.updateSchema),
  permissionController.updatePermission
);

router.delete(
  "/:id",
  checkFeature("permission_delete"),
  permissionController.deletePermission
);

module.exports = router;
