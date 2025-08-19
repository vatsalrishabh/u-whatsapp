// middleware/rateLimiter.js
const rateLimit = require("express-rate-limit");

// Example: Limit each IP to 100 requests per 15 minutes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max requests per IP
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later."
  },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,  // Disable `X-RateLimit-*` headers
});

module.exports = apiLimiter;
