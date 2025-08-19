// middlewares/auth.js

const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided."
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token
    req.user = decoded; // attach decoded payload to request
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: "Invalid or expired token."
    });
  }
};

module.exports = auth;
