const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const { initWhatsapp, getQr, getStatus } = require("./services/whatsappservice");
const apiLimiter = require("./middleware/rateLimiter");
// const auth = require("./middleware/auth");
const apiKeyMiddleware = require("./middleware/apiKeyMiddleware");

dotenv.config();
const app = express();

// Trust proxy for rate-limiter to work correctly behind reverse proxies (like Render/Heroku)
app.set("trust proxy", 1);

// Middleware
app.use(express.json());


// ✅ Enable CORS (allow all)
app.use(cors({
  origin: "*",  // ⚠️ in production, replace "*" with your frontend domain(s)
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization", "x-api-key"],
}));


// Connect to MongoDB
connectDB();

// Initialize WhatsApp
initWhatsapp();

// Apply Rate Limiter globally (for all routes)
app.use(apiLimiter);

// Root route → show QR & status
app.get("/", (req, res) => {
  const qr = getQr();
  const status = getStatus();

  const html = `
    <html>
      <head>
        <title>WhatsApp Web JS</title>
        <style>
          body { font-family: Arial; padding: 20px; }
          .qr { margin: 20px 0; }
          .status { font-size: 1.2em; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <h1>📲 WhatsApp Connection</h1>
        <div class="status"><b>Status:</b> ${status}</div>
        ${qr ? `<div class="qr"><img src="${qr}" alt="WhatsApp QR" /></div>` : "<p>No QR generated yet.</p>"}
      </body>
    </html>
  `;
  res.send(html);
});

// API routes (send messages, get chats, etc.)
const whatsappRoutes = require("./routes/whatsappRoutes");
app.use("/api/whatsapp", apiKeyMiddleware, whatsappRoutes);

// Catch-all for invalid routes
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
