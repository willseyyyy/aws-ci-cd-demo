const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from /public
app.use(express.static(path.join(__dirname, "public")));

// Simple health endpoint for tests / monitoring
app.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

// Start server only if run directly (not when imported by tests)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(` Cool CI/CD demo app running on port ${PORT}`);
  });
}

module.exports = app;
