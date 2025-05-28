const mongoose = require("mongoose");
const config = require("@root/config");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.databaseUrl);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
