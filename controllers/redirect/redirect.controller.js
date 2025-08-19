// controller/redirect.controller.js
const redirectService = require("@services/redirect.service");
const responseHelper = require("@helper/response");

exports.handleRedirect = async (req, res) => {
  try {
    const result = await redirectService.trackClick(req, res);
    if (res.headersSent) return; // service might have already responded on error

    if (result?.redirectUrl && result?.clickId) {
      // 30 minutes
      const maxAgeMs = 30 * 60 * 1000;

      // Make sure this code runs on https://api.afftrex.org (or another *.afftrex.org host)
      res.cookie("click_id", result.clickId, {
        domain: ".afftrex.org", // must be a parent of the response host
        path: "/",
        httpOnly: false, // pixel may read it via JS if you want; set true if server-only
        secure: true, // required for SameSite=None
        sameSite: "none", // allow third-party requests to include it
        maxAge: maxAgeMs,
      });

      return res.redirect(302, result.redirectUrl);
    }

    // Fallback if service returned nothing
    return responseHelper.errorResponse(
      req,
      res,
      "No redirect URL produced.",
      500
    );
  } catch (err) {
    console.error("Redirect error:", err);
    const status = err.statusCode || 500;
    return responseHelper.errorResponse(
      req,
      res,
      err.message || "Internal error",
      status
    );
  }
};
