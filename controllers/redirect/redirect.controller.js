const redirectService = require("@services/redirect.service");
const responseHelper = require("@helper/response");

exports.handleRedirect = async (req, res) => {
  try {
    // pass req.clickId (set by middleware) — service will use it if present
    const result = await redirectService.trackClick(req, res, req.clickId);

    // service may have already sent a response (400/403/404) -> bail out
    if (res.headersSent) return;

    if (result?.redirectUrl && result?.clickId) {
      // append clickId and (optionally) the original p1..p4 params to merchant URL
      try {
        const urlObj = new URL(result.redirectUrl);

        // append clickId
        urlObj.searchParams.set("clickId", result.clickId);

        // optionally forward p1..p4 and any other allowed params (avoid forwarding 'pub')
        ["p1", "p2", "p3", "p4"].forEach((k) => {
          if (req.query[k]) urlObj.searchParams.set(k, req.query[k]);
        });

        return res.redirect(302, urlObj.toString());
      } catch (err) {
        // If campaign.defaultCampaignUrl is not absolute, fallback to simple redirect
        console.warn("redirect URL parsing failed, doing basic redirect:", err);
        return res.redirect(302, result.redirectUrl);
      }
    }

    return;
  } catch (err) {
    console.error("Redirect error:", err);
    const status = err.statusCode || 500;
    return responseHelper.errorResponse(req, res, err.message, status);
  }
};
