const pixelTrackingService = require("@services/pixelTracking.service");
const responseHelper = require("@helper/response");

exports.handlePixelGet = async (req, res) => {
  try {
    const sessionId = await pixelTrackingService.trackPixel(
      req.params.slug,
      req.query,
      req
    );

    // Set sessionId cookie if not present
    if (!req.cookies?.sessionId) {
      res.cookie("sessionId", sessionId, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: "Lax",
      });
    }

    // Return 1x1 gif
    const pixelBuffer = Buffer.from(
      "R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==",
      "base64"
    );
    res.set("Content-Type", "image/gif");
    res.send(pixelBuffer);
  } catch (error) {
    return responseHelper.error(res, error.message);
  }
};

exports.handlePixelPost = async (req, res) => {
  try {
    await pixelTrackingService.trackPixel(req.params.slug, req.body, req);
    return responseHelper.success(res, "Pixel tracked successfully");
  } catch (error) {
    return responseHelper.error(res, error.message);
  }
};
