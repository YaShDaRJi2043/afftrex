const router = require("express").Router();

const permissionRouter = require("@routes/admin/permission/permission.routes");
const roleRouter = require("@routes/admin/role/role.routes");
const companyRouter = require("@root/routes/admin/company/company.routes");

router.use("/permission", permissionRouter);
router.use("/role", roleRouter);
router.use("/company", companyRouter);

module.exports = router;
