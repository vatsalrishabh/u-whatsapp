// middlewares/apiKeyMiddleware.js




const apiKeyMiddleware = (req, res, next) => {
  const apiKey = req.headers["x-api-key"]; // API key should be passed in headers

  if (!apiKey) {
    return res.status(401).json({ error: "API key missing" });
  }

  if (apiKey !== process.env.API_KEY) {
    return res.status(403).json({ error: "Invalid API key" });
  }

  next(); // valid → move to controller
};

module.exports = apiKeyMiddleware;