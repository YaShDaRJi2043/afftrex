// redirect.js
const express = require("express");
const mysql = require("mysql2/promise");
const cookieParser = require("cookie-parser");
const crypto = require("crypto");

const app = express();
app.use(cookieParser());

// MySQL connection pool with your credentials
const pool = mysql.createPool({
  host: "127.0.0.1", // DB Host
  port: 3306, // DB Port
  user: "u275098798_connect", // DB Username
  password: "Maybach@1298", // DB Password
  database: "u275098798_afftrexdbv2", // DB Name
  waitForConnections: true,
  connectionLimit: 10,
});

// Helper: generate unique click ID
function generateClickId() {
  return "clk_" + crypto.randomBytes(8).toString("hex");
}

app.get("/redirect", async (req, res) => {
  try {
    const {
      event_type,
      pub_id,
      campaign_id,
      transaction_id,
      sale_amount,
      currency,
      p1,
      p2,
      p3,
      p4,
    } = req.query;

    if (!event_type || !pub_id || !campaign_id) {
      return res.status(400).send("Missing required parameters.");
    }

    const clickId = generateClickId();

    // Set cookie for click_id (valid 30 mins)
    res.cookie("click_id", clickId, {
      maxAge: 30 * 60 * 1000, // 30 minutes
      httpOnly: false, // allow JS to read for pixel later
      secure: true, // only over HTTPS
      sameSite: "None",
      domain: ".afftrex.com", // allow across subdomains
      path: "/",
    });

    const conn = await pool.getConnection();

    try {
      // Insert into cliksv2
      await conn.execute(
        `INSERT INTO cliksv2 
        (click_id, event_type, pub_id, campaign_id, transaction_id, sale_amount, currency, p1, p2, p3, p4, click_time) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          clickId,
          event_type,
          parseInt(pub_id),
          parseInt(campaign_id),
          transaction_id || "",
          sale_amount || "",
          currency || "",
          p1 || "",
          p2 || "",
          p3 || "",
          p4 || "",
        ]
      );

      // Fetch redirect URL
      const [rows] = await conn.execute(
        "SELECT campaign_url, status FROM campaigns WHERE id = ?",
        [campaign_id]
      );

      if (!rows.length) {
        return res.status(404).send("Campaign not found.");
      }

      const { campaign_url, status } = rows[0];

      if (status === "paused") {
        return res.status(403).send("Campaign is paused.");
      }

      // Append click_id
      let redirectUrl = new URL(campaign_url);
      redirectUrl.searchParams.set("click_id", clickId);

      return res.redirect(302, redirectUrl.toString());
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error("Error in redirect handler:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Start server
app.listen(3000, () => {
  console.log("Redirect server running on port 3000");
});
