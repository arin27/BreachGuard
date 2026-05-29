const express = require("express");
const router = express.Router();

/* ================= AI ADVISOR PROXY ================= */
// This proxies requests to the Anthropic API so the API key stays server-side
router.post("/analyze", async (req, res) => {
  try {
    const { messages, mode = "advisor", breachContext } = req.body;

    const SYSTEM_PROMPTS = {
      advisor: `You are SENTINEL, an elite AI cybersecurity advisor embedded in the BreachGuard data breach intelligence platform. You are an expert in data breach analysis, threat intelligence, attack vector prediction, post-breach remediation, and future cyberattack trend forecasting.

The breach database contains records of emails exposed across LinkedIn, Facebook, Adobe, Twitter, Dropbox, and Canva breaches from 2020–2024.

Your personality: Direct, authoritative, expert. Structure responses clearly. Use emojis sparingly for severity: 🔴 critical, 🟡 medium, 🟢 low.

When predicting future attacks: reference real trends like AI-powered phishing, deepfake social engineering, supply chain attacks, MFA bypass. Be specific and actionable.`,

      scan: `You are SENTINEL in AUTO-SCAN mode. Autonomously analyze breach patterns and produce a structured intelligence report with sections: EXECUTIVE SUMMARY, BREACH PATTERN ANALYSIS, HIGH-RISK TARGETS, ATTACK VECTOR ASSESSMENT, PREDICTIVE THREAT FORECAST (next 6–12 months), RECOMMENDED SECURITY POSTURE. Be analytical and specific.`,

      threat: `You are SENTINEL in THREAT MODELING mode. Think like both an APT actor and defender. For any topic: model how an attacker exploits breach data, identify likely attack chains, predict follow-on scenarios, give MITRE ATT&CK-style breakdown where relevant, and provide defensive countermeasures. Be highly technical.`
    };

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.advisor,
        messages: messages || []
      })
    });

    const data = await response.json();
    res.json(data);

  } catch (err) {
    console.error("AI route error:", err);
    res.status(500).json({ message: "AI service error" });
  }
});

module.exports = router;