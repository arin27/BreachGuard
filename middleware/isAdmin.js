function isAdmin(req, res, next) {
  try {
    if (req.user && req.user.role === "admin") {
      return next();
    }

    return res.status(403).json({
      message: "Admin access required"
    });

  } catch (err) {
    return res.status(500).json({
      message: "Authorization error"
    });
  }
}

module.exports = isAdmin;