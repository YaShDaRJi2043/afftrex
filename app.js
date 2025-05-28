const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const router = require("@routes/routes");
const { serverInfo } = require("@config/config");
const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());

app.use(serverInfo.host_url_prefix, router);

module.exports = app;
