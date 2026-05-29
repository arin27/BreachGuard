const mongoose = require("mongoose");

const searchLogSchema = new mongoose.Schema({
  searchType: {
    type: String,
    enum: ["email", "phone", "domain", "footprint"],
    required: true,
  },
  query: {
    type: String,
    required: true,
  },
  resultCount: {
    type: Number,
    default: 0,
  },
  riskLevel: {
    type: String,
    enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL", "NONE"],
    default: "NONE",
  },
  ipAddress: {
    type: String,
    default: "unknown",
  },
  userAgent: {
    type: String,
    default: "unknown",
  },
  searchedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("SearchLog", searchLogSchema);