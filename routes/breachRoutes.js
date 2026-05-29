const express = require("express");
const Breach = require("../models/Breach");
const SearchLog = require("../models/SearchLog");

const router = express.Router();

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = "breachdirectory.p.rapidapi.com";

/* ================= HELPER: Call BreachDirectory API ================= */
async function queryBreachDirectory(term) {
  try {
    const url = `https://breachdirectory.p.rapidapi.com/?func=auto&term=${encodeURIComponent(term)}`;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": RAPIDAPI_HOST,
      },
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("BreachDirectory API error:", err);
    return null;
  }
}

/* ================= CHECK EMAIL BREACH ================= */
router.post("/check", async (req, res) => {
  try {
    const { email } = req.body;

    // 1. Check real BreachDirectory API
    let realBreaches = [];
    let apiWorked = false;

    if (RAPIDAPI_KEY) {
      const apiData = await queryBreachDirectory(email);
      if (apiData && apiData.found > 0 && apiData.result) {
        apiWorked = true;
        realBreaches = apiData.result.map(b => ({
          email,
          breachSource: b.sources?.[0] || "Unknown Source",
          breachDate: b.last_breach || new Date().toISOString(),
          passwordExposed: b.password ? true : false,
          hashedPassword: b.password || null,
          sources: b.sources || [],
        }));
      } else if (apiData && apiData.found === 0) {
        apiWorked = true; // API worked, just no results
      }
    }

    // 2. Fall back to your local MongoDB if API fails
    let breaches = realBreaches;
    if (!apiWorked) {
      const localBreaches = await Breach.find({ email });
      breaches = localBreaches.map(b => ({
        email: b.email,
        breachSource: b.breachSource,
        breachDate: b.breachDate,
      }));
    }

    const breachCount = breaches.length;
    const riskLevel =
      breachCount === 0 ? "NONE" :
      breachCount <= 2  ? "MEDIUM" : "HIGH";

    // 3. Log search to MongoDB
    await SearchLog.create({
      searchType: "email",
      query: email,
      resultCount: breachCount,
      riskLevel,
      ipAddress: req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown",
      userAgent: req.headers["user-agent"] || "unknown",
    }).catch(() => {}); // don't crash if log fails

    res.json({
      email,
      breached: breachCount > 0,
      breachCount,
      breaches,
      source: apiWorked ? "BreachDirectory API" : "Local Database",
    });

  } catch (error) {
    console.error("Breach check error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= CHECK PHONE BREACH ================= */
router.post("/check-phone", async (req, res) => {
  try {
    const { phone } = req.body;

    let results = [];
    let apiWorked = false;

    if (RAPIDAPI_KEY) {
      const apiData = await queryBreachDirectory(phone);
      if (apiData && apiData.found > 0 && apiData.result) {
        apiWorked = true;
        results = apiData.result.map(b => ({
          phone,
          breachSource: b.sources?.[0] || "Unknown Source",
          breachDate: b.last_breach || new Date().toISOString(),
          sources: b.sources || [],
        }));
      } else if (apiData && apiData.found === 0) {
        apiWorked = true;
      }
    }

    const breachCount = results.length;
    const riskLevel = breachCount === 0 ? "NONE" : breachCount <= 2 ? "MEDIUM" : "HIGH";

    // Log it
    await SearchLog.create({
      searchType: "phone",
      query: phone,
      resultCount: breachCount,
      riskLevel,
      ipAddress: req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown",
      userAgent: req.headers["user-agent"] || "unknown",
    }).catch(() => {});

    res.json({
      phone,
      breached: breachCount > 0,
      breachCount,
      breaches: results,
      source: apiWorked ? "BreachDirectory API" : "Simulated",
    });

  } catch (error) {
    console.error("Phone check error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= CHECK DOMAIN BREACH ================= */
router.post("/check-domain", async (req, res) => {
  try {
    const { domain } = req.body;

    let results = [];
    let apiWorked = false;

    if (RAPIDAPI_KEY) {
      const apiData = await queryBreachDirectory(domain);
      if (apiData && apiData.found > 0 && apiData.result) {
        apiWorked = true;
        results = apiData.result.map(b => ({
          domain,
          email: b.email || "hidden@" + domain,
          breachSource: b.sources?.[0] || "Unknown Source",
          breachDate: b.last_breach || new Date().toISOString(),
          sources: b.sources || [],
        }));
      } else if (apiData && apiData.found === 0) {
        apiWorked = true;
      }
    }

    // Also check local DB for this domain
    const localBreaches = await Breach.find({
      email: { $regex: "@" + domain + "$", $options: "i" }
    });

    const combined = [...results];
    localBreaches.forEach(b => {
      if (!combined.find(r => r.email === b.email)) {
        combined.push({
          domain,
          email: b.email,
          breachSource: b.breachSource,
          breachDate: b.breachDate,
        });
      }
    });

    const breachCount = combined.length;
    const riskLevel = breachCount === 0 ? "NONE" : breachCount <= 3 ? "MEDIUM" : "HIGH";

    await SearchLog.create({
      searchType: "domain",
      query: domain,
      resultCount: breachCount,
      riskLevel,
      ipAddress: req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown",
      userAgent: req.headers["user-agent"] || "unknown",
    }).catch(() => {});

    res.json({
      domain,
      breached: breachCount > 0,
      breachCount,
      breaches: combined,
      source: apiWorked ? "BreachDirectory API + Local DB" : "Local Database",
    });

  } catch (error) {
    console.error("Domain check error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= LOG FOOTPRINT SEARCHES ================= */
router.post("/log", async (req, res) => {
  try {
    const { searchType, query, resultCount, riskLevel } = req.body;
    await SearchLog.create({
      searchType: searchType || "email",
      query,
      resultCount: resultCount || 0,
      riskLevel: riskLevel || "NONE",
      ipAddress: req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown",
      userAgent: req.headers["user-agent"] || "unknown",
    });
    res.json({ message: "Logged" });
  } catch (err) {
    res.status(500).json({ message: "Log error" });
  }
});

/* ================= GET ALL BREACHES (local DB) ================= */
router.get("/all", async (req, res) => {
  try {
    const breaches = await Breach.find().sort({ breachDate: -1 });
    res.json({ count: breaches.length, breaches });
  } catch (error) {
    console.error("Fetch breaches error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;