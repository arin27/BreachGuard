const jwt = require("jsonwebtoken");

/* ================= VERIFY TOKEN ================= */
const verifyToken = (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = header.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // attach user info
    next();

  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = verifyToken;