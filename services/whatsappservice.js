// services/whatsappservice.js
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode");

let client = null;
let qrCodeImage = null;
let connectionStatus = "Not started";
let reconnectAttempts = 0;
const MAX_RECONNECT_DELAY = 60 * 1000; // 1 minute max

function delayForAttempt(attempt) {
  // Exponential backoff with jitter
  const base = Math.min(30000, 1000 * Math.pow(2, attempt)); // up to 30s base
  const jitter = Math.floor(Math.random() * 3000); // up to 3s jitter
  return Math.min(MAX_RECONNECT_DELAY, base + jitter);
}

const createClient = () => {
  return new Client({
    authStrategy: new LocalAuth({ clientId: "my-session" }),
    puppeteer: {
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-extensions",
        "--disable-gpu",
        "--no-first-run",
        "--single-process",
        "--disable-dev-profile"
      ],
    },
    // optional: set puppeteerTimeout if needed
  });
};

const initWhatsapp = () => {
  if (client) return client; // already initialized or initializing

  client = createClient();

  // QR code event
  client.on("qr", async (qr) => {
    try {
      qrCodeImage = await qrcode.toDataURL(qr);
      connectionStatus = "QR code generated. Scan it with WhatsApp.";
      console.log("[WA] QR code generated.");
    } catch (err) {
      console.error("[WA] QR generation error:", err);
    }
  });

  client.on("loading_screen", (percent, message) => {
    // useful for debugging slow boots
    console.log(`[WA] Loading ${percent}% - ${message}`);
  });

  client.on("authenticated", () => {
    connectionStatus = "Authenticated 🔑";
    console.log("[WA] Authenticated");
  });

  client.on("auth_failure", (msg) => {
    // Authentication failure — usually invalid session
    connectionStatus = "Auth Failure ❌";
    console.error("[WA] auth_failure:", msg);
    // Reset client state and attempt reconnect
    try {
      // Destroy and nullify will trigger reconnect below
      client.destroy().catch(() => {});
    } catch (e) {
      console.error("[WA] error destroying client after auth_failure", e);
    }
  });

  client.on("ready", () => {
    connectionStatus = "WhatsApp is Ready ✅";
    reconnectAttempts = 0;
    console.log("[WA] Ready");
  });

  client.on("disconnected", (reason) => {
    connectionStatus = `Disconnected ⚠️ (${reason})`;
    console.warn("[WA] Disconnected:", reason);
    // destroy client and schedule a reconnect
    safeRestart();
  });

  client.on("change_state", (state) => {
    // when the underlying WhatsApp connection state changes
    console.log("[WA] change_state:", state);
  });

  client.on("message_create", (message) => {
    // Handle incoming messages if you want; runs for outgoing too
    console.log(`[WA] message_create from ${message.from}: ${message.body}`);
  });

  client.on("message", (message) => {
    // This triggers for received messages
    // Add your message handlers here (auto-replies, commands, etc.)
    // IMPORTANT: Don't block this event with long sync tasks.
    console.log(`[WA] message received from ${message.from}: ${message.body}`);
  });

  // generic error handler
  client.on("error", (err) => {
    console.error("[WA] client error:", err && err.message ? err.message : err);
    // attempt restart for puppeteer crashes or similar
    safeRestart();
  });

  // Initialize and catch initialization errors
  client.initialize().catch((err) => {
    console.error("[WA] initialize error:", err);
    safeRestart();
  });

  return client;
};

/**
 * Safe restart: destroys existing client, nullifies state, and schedules re-init
 * with exponential backoff to avoid tight restart loops.
 */
function safeRestart() {
  try {
    if (client) {
      // remove listeners to avoid duplicate handlers across restarts
      client.removeAllListeners();
      client.destroy().catch(() => {});
    }
  } catch (e) {
    console.error("[WA] error destroying client during safeRestart:", e);
  } finally {
    client = null;
    qrCodeImage = null;
    reconnectAttempts += 1;
    const wait = delayForAttempt(reconnectAttempts);
    console.log(`[WA] Scheduling reconnect attempt #${reconnectAttempts} in ${wait}ms`);
    setTimeout(() => {
      try {
        initWhatsapp();
      } catch (err) {
        console.error("[WA] error during reconnect init:", err);
      }
    }, wait);
  }
}

/**
 * Helper: send a message (returns a Promise which resolves when send completes)
 * Accepts whatsapp number in international format with country code, e.g. '918123456789@c.us'
 */
async function sendMessage(to, text, options = {}) {
  if (!client) throw new Error("WhatsApp client not initialized");
  const isReady = connectionStatus && connectionStatus.toLowerCase().includes("ready");
  if (!isReady) throw new Error("WhatsApp client not ready yet");
  return client.sendMessage(to, text, options);
}

const getClient = () => client;
const getQr = () => qrCodeImage;
const getStatus = () => connectionStatus;

process.on("SIGINT", async () => {
  console.log("[WA] SIGINT received: shutting down WhatsApp client");
  try {
    if (client) {
      await client.destroy();
      client = null;
    }
  } catch (e) {
    console.error("[WA] error during shutdown:", e);
  } finally {
    process.exit(0);
  }
});

module.exports = {
  initWhatsapp,
  getClient,
  getQr,
  getStatus,
  sendMessage,
};
