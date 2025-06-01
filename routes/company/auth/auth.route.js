const router = require("express").Router();

const companyController = require("@controllers/company/company.controller");
const companyValidator = require("@controllers/company/company.validator");
const validate = require("@middleware/validate");
const upload = require("@middleware/multer");

router.post(
  "/register",
  upload.single("logo"),
  validate(companyValidator.create),
  companyController.registerCompany
);
router.get("/loginInfo", companyController.LoginInfoCompany);

module.exports = router;
