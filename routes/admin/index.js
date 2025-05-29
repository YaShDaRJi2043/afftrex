const router = require("express").Router();

const permissionRouter = require("@routes/admin/permission/permission.routes");
const roleRouter = require("@routes/admin/role/role.routes");

router.use("/permission", permissionRouter);
router.use("/role", roleRouter);

module.exports = router;
