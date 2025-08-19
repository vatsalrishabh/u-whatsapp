const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const { initWhatsapp, getQr, getStatus } = require("./services/whatsappservice");
const apiLimiter  = require("./middleware/rateLimiter");
// const auth = require("./middleware/auth");
const apiKeyMiddleware = require("./middleware/apiKeyMiddleware");

dotenv.config();
const app = express();

// Trust proxy for rate-limiter to work behind proxy
app.set("trust proxy", 1);

// Middleware
app.use(express.json());

// DB
connectDB();

// Init WhatsApp
initWhatsapp();

// Apply Rate Limiter globally (for all routes)
app.use(apiLimiter);

// Root route → show QR & status
app.get("/", (req, res) => {
  const qr = getQr();
  const status = getStatus();

  let html = `
    <html>
      <head>
        <title>WhatsApp Web JS</title>
        <style>
          body { font-family: Arial; padding: 20px; }
          .qr { margin: 20px 0; }
        </style>
      </head>
      <body>
        <h1>📲 WhatsApp Connection</h1>
        <p><b>Status:</b> ${status}</p>
        ${qr ? `<div class="qr"><img src="${qr}" /></div>` : "<p>No QR generated.</p>"}
      </body>
    </html>
  `;
  res.send(html);
});

// API routes (for sending messages etc.)
const whatsappRoutes = require("./routes/whatsappRoutes");
app.use("/api/whatsapp", apiKeyMiddleware, whatsappRoutes); // jwt middleware added

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
