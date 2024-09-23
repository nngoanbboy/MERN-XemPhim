// authMiddleware.js
const jwt = require("jsonwebtoken");

// Xác thực người dùng
const authenticate = async (req, res, next) => {
  let token = req.header("Authorization");

  // If token is not found in header, try to find it in cookies
  if (!token && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res
      .status(401)
      .json({ status: false, msg: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(
      token.replace("Bearer ", ""),
      process.env.JWT_SECRET
    );

    req.user = decoded; // Attach user information to request object

    next();
  } catch (err) {
    res.status(400).json({ status: false, msg: "Invalid token." });
  }
};

// Kiểm tra quyen admin
const authorizeAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res
      .status(403)
      .json({ status: false, msg: "Access denied. Admin rights required." });
  }
  next();
};

module.exports = {
  authenticate,
  authorizeAdmin,
};
