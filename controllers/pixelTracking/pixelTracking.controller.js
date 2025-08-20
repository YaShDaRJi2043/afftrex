// controller/pixel.controller.js
const cookieParser = require("cookie-parser"); // ensure app uses this middleware
const pixelTrackingService = require("@services/pixelTracking.service");

// tiny 1x1 gif buffer (GIF89a transparent)
const ONE_BY_ONE_GIF = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==",
  "base64"
);

function sendGif(res) {
  res.set({
    "Content-Type": "image/gif",
    "Content-Length": ONE_BY_ONE_GIF.length,
    "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
    Pragma: "no-cache",
    Expires: "0",
    "X-Content-Type-Options": "nosniff",
    // CORS is not required for <img>, but harmless:
    "Access-Control-Allow-Origin": "*",
  });
  return res.status(200).send(ONE_BY_ONE_GIF);
}

exports.handlePixelGet = async (req, res) => {
  try {
    await pixelTrackingService.trackPixel(req.params.slug, req.query, req);
    return sendGif(res);
  } catch (error) {
    // Do NOT leak errors to client; always return the pixel
    console.error("pixel GET error:", error?.message || error);
    return sendGif(res);
  }
};

exports.handlePostback = async (req, res) => {
  try {
    await pixelTrackingService.trackPostback(req.params.slug, req.query, req);
    return res.status(200).send("Postback tracked successfully");
  } catch (error) {
    console.error("postback error:", error?.message || error);
    return res.status(400).send(error.message || "Bad Request");
  }
};
