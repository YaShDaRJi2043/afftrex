const router = require("express").Router();
const roleController = require("@controllers/role/role.controller");
const roleValidator = require("@controllers/role/role.validator");

const validate = require("@middleware/validate");
const { checkFeature } = require("@middleware/checkFeature");
const authMiddleware = require("@middleware/auth.middleware");

// Apply JWT auth to all routes in this router
router.use(authMiddleware);

router.get("/", checkFeature("manage_roles"), roleController.index);
router.get("/:id", checkFeature("manage_roles"), roleController.show);

router.post(
  "/",
  checkFeature("manage_roles"),
  validate(roleValidator.create),
  roleController.create
);

router.put(
  "/:id",
  checkFeature("manage_roles"),
  validate(roleValidator.update),
  roleController.update
);

router.delete("/:id", checkFeature("manage_roles"), roleController.remove);

module.exports = router;
