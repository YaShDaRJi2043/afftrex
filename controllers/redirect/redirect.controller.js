const redirectService = require("@services/redirect.service");
const responseHelper = require("@helper/response");

exports.handleRedirect = async (req, res) => {
  try {
    // Pass req.clickId (set by middleware) — service will use it if present
    const result = await redirectService.trackClick(req, res, req.clickId);

    // Service may have already sent a response (400/403/404) -> bail out
    if (res.headersSent) return;

    if (result?.redirectUrl && result?.clickId) {
      try {
        const urlObj = new URL(result.redirectUrl);

        // Append clickId
        urlObj.searchParams.set("clickId", result.clickId);

        // Optionally forward p1..p4 and any other allowed params (avoid forwarding 'pub')
        ["p1", "p2", "p3", "p4"].forEach((k) => {
          if (req.query[k]) urlObj.searchParams.set(k, req.query[k]);
        });

        return res.redirect(302, urlObj.toString());
      } catch (err) {
        console.warn("Redirect URL parsing failed, doing basic redirect:", err);
        return res.redirect(302, result.redirectUrl);
      }
    }

    // If no redirect URL is provided, return an error
    return responseHelper.errorResponse(
      req,
      res,
      "Redirect URL not found",
      400
    );
  } catch (err) {
    console.error("Redirect error:", err);
    const status = err.statusCode || 500;
    return responseHelper.errorResponse(req, res, err.message, status);
  }
};
