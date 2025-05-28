const { canAccessFeature } = require("@utils/permissions");

function checkFeature(featureKey) {
  return async (req, res, next) => {
    const allowed = await canAccessFeature(req.user, featureKey);
    if (!allowed) {
      return res
        .status(403)
        .json({ message: "Access denied for this feature." });
    }
    next();
  };
}

module.exports = { checkFeature };
