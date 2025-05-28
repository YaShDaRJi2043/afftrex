const router = require("express").Router();

router.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server is running 🚀",
    time: new Date().toISOString(),
  });
});

module.exports = router;
