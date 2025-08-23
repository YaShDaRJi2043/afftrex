const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");

const router = require("@routes/routes");
const { serverInfo } = require("@config/config");
const redirectRoutes = require("@routes/redirect.route");
const pixelRoutes = require("@routes/pixelTracking.routes");
const app = express();

app.set("trust proxy", true);

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
