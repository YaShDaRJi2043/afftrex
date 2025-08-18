const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const multer = require("multer");
const cookieParser = require("cookie-parser"); // Added cookie-parser
const path = require("path");

const router = require("@routes/routes");
const { serverInfo } = require("@config/config");
const redirectRoutes = require("@routes/redirect.route");
const pixelRoutes = require("@routes/pixelTracking.routes");
const app = express();

app.set("trust proxy", true);

// Set the view engine to EJS
app.set("view engine", "ejs");

// Set the directory for views
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(cookieParser());

app.use(serverInfo.host_url_prefix, router);
app.use("/public", redirectRoutes);
app.use("/", pixelRoutes);

app.use((err, req, res, next) => {
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

module.exports = app;
