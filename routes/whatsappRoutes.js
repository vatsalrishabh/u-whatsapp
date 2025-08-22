// routes/whatsappRoutes.js
const express = require("express");
const router = express.Router();
const {
  sendMessage,
  sendMedia,
  getChats,
  getMessages,
  getChatsByNumber,
   getClient, getStatus,

} = require("../controllers/whatsappController");


// GET /api/whatsapp/status
router.get("/status", (req, res) => {
  const status = getStatus();
  res.json({ status });
});


// POST /api/whatsapp/send → send text messages
router.post("/send", sendMessage);

// POST /api/whatsapp/send-media → send images, docs, media
router.post("/send-media", sendMedia);

// GET /api/whatsapp/chats → fetch all chats
router.get("/chats", getChats);

// GET /api/whatsapp/messages → fetch messages from a chat
// Example query: /api/whatsapp/messages?chatId=911234567890@c.us&limit=50
router.get("/messages", getMessages);


// GET /api/whatsapp/chats-by-number?number=911234567890
router.get("/chats-by-number", getChatsByNumber);

module.exports = router;
