const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

// ── Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// ── Routes
const authRoutes   = require("./routes/authRoutes");
const adminRoutes  = require("./routes/adminRoutes");
const breachRoutes = require("./routes/breachRoutes");
const aiRoutes     = require("./routes/aiRoutes");

app.use("/api/auth",   authRoutes);
app.use("/api/admin",  adminRoutes);
app.use("/api/breach", breachRoutes);
app.use("/api/ai",     aiRoutes);

app.get("/api/health", (req, res) => res.json({ status: "OK" }));

const PORT = process.env.PORT || 5000;

connectDB().catch(() => {
  console.log("⚠️  DB not connected yet");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});