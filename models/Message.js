// models/Message.js
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  messageId: { type: String },           // WhatsApp message ID
  chatId: { type: String, required: true }, // Phone number with @c.us
  sender: { type: String },              // Who sent it (you or contact)
  type: { type: String, enum: ["sent", "received"], required: true },
  body: { type: String },
  ipAddress: { type: String },           // IP address from request
  timestamp: { type: Date, default: Date.now },
  status: { type: String },              // delivered, read, pending, etc.
});

module.exports = mongoose.model("Message", messageSchema);
