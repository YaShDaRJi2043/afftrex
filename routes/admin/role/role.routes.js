const router = require("express").Router();
const roleController = require("@controllers/role/role.controller");
const roleValidator = require("@controllers/role/role.validator");

const validate = require("@middleware/validate");
const { checkFeature } = require("@middleware/checkFeature");
const authMiddleware = require("@middleware/auth.middleware");

// Apply JWT auth to all routes in this router
router.use(authMiddleware);

router.get("/", checkFeature("role_view_all"), roleController.index);
router.get("/:id", checkFeature("role_view"), roleController.show);

router.post(
  "/",
  checkFeature("role_create"),
  validate(roleValidator.create),
  roleController.create
);

router.put(
  "/:id",
  checkFeature("role_edit"),
  validate(roleValidator.update),
  roleController.update
);

router.delete("/:id", checkFeature("role_delete"), roleController.remove);

module.exports = router;
