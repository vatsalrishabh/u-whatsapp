// services/whatsappservice.js


// services/whatsappservice.js
const { Client } = require("whatsapp-web.js");
const qrcode = require("qrcode");
const Session = require("../models/Session");

let client;
let qrCodeData;
let status = "disconnected";

const initWhatsapp = async () => {
  client = new Client({
    puppeteer: { headless: true },
    session: null,
  });

  client.on("qr", async (qr) => {
    qrCodeData = await qrcode.toDataURL(qr); // convert QR to base64
    status = "qr";
    console.log("QR RECEIVED");
  });

  client.on("authenticated", async (session) => {
    console.log("AUTHENTICATED", session);
    status = "authenticated";
    await Session.findOneAndUpdate(
      { _id: "whatsapp-session" },
      { session },
      { upsert: true }
    );
  });

  client.on("ready", () => {
    console.log("Client is ready!");
    status = "ready";
  });

  client.on("disconnected", () => {
    console.log("Client disconnected");
    status = "disconnected";
  });

  client.initialize();
};

const getClient = () => client;
const getQr = () => qrCodeData;
const getStatus = () => status;

module.exports = { initWhatsapp, getClient, getQr, getStatus };
