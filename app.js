const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const multer = require("multer");

const router = require("@routes/routes");
const { serverInfo } = require("@config/config");
const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());

app.use(serverInfo.host_url_prefix, router);

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

module.exports = app;
