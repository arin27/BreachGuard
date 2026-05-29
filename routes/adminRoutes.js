const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/isAdmin");
const User = require("../models/User");
const SearchLog = require("../models/SearchLog");

/* ================= GET ALL USERS ================= */
router.get("/users", verifyToken, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json({ count: users.length, users });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= GET ALL SEARCH LOGS ================= */
router.get("/searches", verifyToken, isAdmin, async (req, res) => {
  try {
    const logs = await SearchLog.find().sort({ searchedAt: -1 }).limit(500);

    const total = logs.length;
    const byType = logs.reduce((acc, l) => {
      acc[l.searchType] = (acc[l.searchType] || 0) + 1;
      return acc;
    }, {});
    const highRisk = logs.filter(l => ["HIGH","CRITICAL"].includes(l.riskLevel)).length;
    const today = logs.filter(l => {
      return new Date(l.searchedAt).toDateString() === new Date().toDateString();
    }).length;

    res.json({ total, byType, highRisk, today, logs });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= DB STATS OVERVIEW ================= */
router.get("/db-stats", verifyToken, isAdmin, async (req, res) => {
  try {
    const [userCount, searchCount] = await Promise.all([
      User.countDocuments(),
      SearchLog.countDocuments(),
    ]);
    const recentSearches = await SearchLog.find().sort({ searchedAt: -1 }).limit(10);
    const recentUsers = await User.find().select("-password").sort({ createdAt: -1 }).limit(5);

    res.json({ userCount, searchCount, recentSearches, recentUsers });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;