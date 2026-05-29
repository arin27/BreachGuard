const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "breachDB",
    });
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB Error:", error.message);
    throw error;
  }
};

module.exports = connectDB;