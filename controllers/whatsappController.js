//controllers/whatsappController.js
 
const { getClient } = require("../services/whatsappservice");

exports.sendMessage = async (req, res) => {
  try {
    const { numbers, message } = req.body;

    if (!Array.isArray(numbers) || numbers.length === 0 || !message) {
      return res.status(400).json({ error: "Numbers (array) and message are required" });
    }

    const client = getClient();
    if (!client) {
      return res.status(500).json({ error: "WhatsApp client not initialized yet." });
    }

    // Send message to all numbers
    for (const num of numbers) {
      const phone = num.toString().replace(/\D/g, ""); // clean input
      if (phone.length >= 10) {
        await client.sendMessage(`${phone}@c.us`, message);
      }
    }

    res.json({ success: true, message: "Messages sent successfully ✅" });
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ error: "Error sending messages" });
  }
};
