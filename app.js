const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const multer = require("multer");
const cookieParser = require("cookie-parser");

const router = require("@routes/routes");
const { serverInfo } = require("@config/config");
const redirectRoutes = require("@routes/redirect.route");
const pixelRoutes = require("@routes/pixelTracking.routes");
const cookieHandler = require("@middleware/cookieHandler");

const app = express();

app.set("trust proxy", true);

app.use(express.json());
app.use(
  cors({
    origin: true, // Allow any frontend to send cookies
    credentials: true,
  })
);
app.use(helmet());
app.use(cookieParser());

// Apply cookie handler middleware globally
app.use(cookieHandler);

// Main API routes
app.use(serverInfo.host_url_prefix, router);

// Public redirect route
app.use("/public", redirectRoutes);

// Pixel tracking route
app.use("/pixel", pixelRoutes);

// Error handler
app.use((err, req, res, next) => {
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

module.exports = app;
