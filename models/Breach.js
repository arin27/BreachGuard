const mongoose = require("mongoose");

const breachSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    index: true,
  },
  breachSource: {
    type: String,
    required: true,
  },
  breachDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Breach", breachSchema);