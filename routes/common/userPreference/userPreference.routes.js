const router = require("express").Router();

const userPreferenceController = require("@controllers/userPreference/userPreference.controller");
const authMiddleware = require("@root/middleware/auth.middleware");

// ✅ Protect all routes with JWT
router.use(authMiddleware);

// Save/Update preferences for a form
router.post("/", userPreferenceController.savePreferences);

// Get preferences by form
router.get("/:form", userPreferenceController.getPreferences);

module.exports = router;
