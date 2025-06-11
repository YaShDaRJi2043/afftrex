const router = require("express").Router();

const permissionRouter = require("@routes/admin/permission/permission.routes");
const roleRouter = require("@routes/admin/role/role.routes");
const companyRouter = require("@root/routes/admin/company/company.routes");
const userRouter = require("@root/routes/admin/user/user.routes");
const campaignRouter = require("@root/routes/admin/campaign/campaign.routes");

router.use("/permission", permissionRouter);
router.use("/role", roleRouter);
router.use("/company", companyRouter);
router.use("/user", userRouter);
router.use("/campaign", campaignRouter);

module.exports = router;
