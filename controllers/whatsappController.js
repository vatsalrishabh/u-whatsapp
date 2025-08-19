//controllers/whatsappController.js
const Message = require("../models/Message");
const { getClient } = require("../services/whatsappservice");

exports.sendMessage = async (req, res) => {
  try {
    const { numbers, message } = req.body;
    const client = getClient();
    const ip = req.ip;

    if (!Array.isArray(numbers) || numbers.length === 0 || !message) {
      return res.status(400).json({ error: "Numbers (array) and message are required" });
    }

    for (const num of numbers) {
      const phone = num.toString().replace(/\D/g, "");
      if (phone.length >= 10) {
        const msg = await client.sendMessage(`${phone}@c.us`, message);

        // Save sent message to DB
        await Message.create({
          messageId: msg.id._serialized,
          chatId: `${phone}@c.us`,
          sender: "me",
          type: "sent",
          body: message,
          ipAddress: ip,
          status: msg._data?.status || "sent",
        });
      }
    }

    res.json({ success: true, message: "Messages sent and saved successfully ✅" });
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ error: "Error sending messages" });
  }
};

exports.receiveMessages = (client) => {
  client.on("message", async (msg) => {
    try {
      await Message.create({
        messageId: msg.id._serialized,
        chatId: msg.from,
        sender: msg.fromMe ? "me" : msg.from,
        type: msg.fromMe ? "sent" : "received",
        body: msg.body,
        ipAddress: "server", // as it’s from WhatsApp server
        status: msg._data?.status || "received",
      });
      console.log(`Saved incoming message from ${msg.from}`);
    } catch (err) {
      console.error("Error saving received message:", err);
    }
  });
};



exports.sendMedia = async (req, res) => {
  try {
    const { number, fileUrl, caption } = req.body;
    if (!number || !fileUrl) return res.status(400).json({ error: "Number and fileUrl required" });

    const client = getClient();
    if (!client) return res.status(500).json({ error: "WhatsApp client not initialized" });

    const { MessageMedia } = require("whatsapp-web.js");
    const media = await MessageMedia.fromUrl(fileUrl);

    const phone = number.toString().replace(/\D/g, "");
    await client.sendMessage(`${phone}@c.us`, media, { caption: caption || "" });

    res.json({ success: true, message: "Media sent ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error sending media" });
  }
};


exports.getChats = async (req, res) => {
  try {
    const client = getClient();
    if (!client) return res.status(500).json({ error: "WhatsApp client not initialized" });

    const chats = await client.getChats();
    res.json({ success: true, chats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching chats" });
  }
};


exports.getMessages = async (req, res) => {
  try {
    const { chatId, limit } = req.query; // e.g., "911234567890@c.us" or group ID
    if (!chatId) return res.status(400).json({ error: "chatId is required" });

    const client = getClient();
    if (!client) return res.status(500).json({ error: "WhatsApp client not initialized" });

    const chat = await client.getChatById(chatId);
    const messages = await chat.fetchMessages({ limit: parseInt(limit) || 20 });

    res.json({ success: true, messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching messages" });
  }
};


// controllers/whatsappController.js
exports.getChatsByNumber = async (req, res) => {
  try {
    const { number } = req.query;
    if (!number) {
      return res.status(400).json({ error: "Number is required" });
    }

    const client = getClient();
    if (!client) {
      return res.status(500).json({ error: "WhatsApp client not initialized yet." });
    }

    const chats = await client.getChats(); // fetch all chats
    const phoneId = `${number.replace(/\D/g, "")}@c.us`;

    // Filter chats for the specific number
    const filteredChats = chats.filter(chat => chat.id._serialized === phoneId);

    res.json({ chats: filteredChats });
  } catch (err) {
    console.error("Error fetching chats:", err);
    res.status(500).json({ error: "Error fetching chats" });
  }
};
