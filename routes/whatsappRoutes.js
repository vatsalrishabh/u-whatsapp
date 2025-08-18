//routes/whatsappRoutes.js

const express = require("express");
const router = express.Router();
const { sendMessage } = require("../controllers/whatsappController");

// POST /api/whatsapp/send
router.post("/send", sendMessage);

module.exports = router;