require("module-alias/register");
require("dotenv").config();

const app = require("@root/app");
const config = require("@config/config");
require("@models");

// Start server
const port = config.serverInfo.port;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
