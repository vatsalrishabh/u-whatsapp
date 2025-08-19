// services/whatsappservice.js
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode");


let client = null;
let qrCodeImage = null;
let connectionStatus = "Not started";

// Initialize WhatsApp client
const initWhatsapp = () => {
  if (client) return client; // already initialized

  client = new Client({
    authStrategy: new LocalAuth({ clientId: "my-session" }), // persistent session
    puppeteer: {
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-extensions",
        "--disable-gpu",
      ],
    },
  });

  // QR code event
  client.on("qr", async (qr) => {
    try {
      qrCodeImage = await qrcode.toDataURL(qr);
      connectionStatus = "QR code generated. Scan it with WhatsApp.";
      console.log("QR Code Generated.");
    } catch (err) {
      console.error("QR generation error:", err);
    }
  });

  // Ready event
  client.on("ready", () => {
    connectionStatus = "WhatsApp is Ready ✅";
    console.log("WhatsApp Ready");
   
  });

  // Authenticated event
  client.on("authenticated", () => {
    connectionStatus = "Authenticated 🔑";
    console.log("WhatsApp Authenticated");
  });

  // Auth failure
  client.on("auth_failure", (msg) => {
    connectionStatus = "Auth Failure ❌";
    console.error("WhatsApp Auth Failure:", msg);
  });

  // Disconnected
  client.on("disconnected", (reason) => {
    connectionStatus = "Disconnected ⚠️";
    console.warn("WhatsApp Disconnected:", reason);
    try {
      client.destroy();
    } catch (err) {
      console.error("Error destroying client:", err);
    }
    client = null;
    qrCodeImage = null;
    // Auto-reconnect after 5 seconds
    setTimeout(() => initWhatsapp(), 5000);
  });

  // Initialize client
  client.initialize();

  return client;
};

// Accessor functions
const getClient = () => client;
const getQr = () => qrCodeImage;
const getStatus = () => connectionStatus;

module.exports = { initWhatsapp, getClient, getQr, getStatus };
