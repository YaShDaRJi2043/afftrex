const pixelTrackingService = require("@services/pixelTracking.service");
const responseHelper = require("@helper/response");

exports.handlePixelGet = async (req, res) => {
  try {
    await pixelTrackingService.trackPixel(req.params.slug, req.query, req);

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

exports.handlePostback = async (req, res) => {
  try {
    await pixelTrackingService.trackPostback(req.params.slug, req.query, req);
    return res.status(200).send("Postback tracked successfully");
  } catch (error) {
    return res.status(400).send(error.message);
  }
};
