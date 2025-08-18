const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const whatsappRoutes = require("./routes/whatsappRoutes");
const { initWhatsapp } = require("./services/whatsappservice");

dotenv.config();
const app = express();

// Middleware
app.use(express.json());

// DB
connectDB();

// Init WhatsApp
initWhatsapp();

// Routes
app.use("/api/whatsapp", whatsappRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
