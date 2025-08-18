const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    clientId: { type: String, required: true, unique: true },
    sessionData: { type: Object, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Session", sessionSchema);
