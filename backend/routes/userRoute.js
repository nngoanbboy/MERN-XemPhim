// routes/user.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authmiddleware");
const UserSchema = require("../models/userModel");

// Đăng ký người dùng
router.post("/register", userController.registerUser);

// Đăng nhâi người dùng
router.post("/login", userController.loginUser);

// Đăng xuất người dùng
router.get("/logout", userController.logoutUser);
//Lay tat ca người dùng
router.get("/", userController.getAllUsers);
// Lay người dùng hien tại
router.get("/user", authMiddleware.authenticate, userController.getCurrentUser);
// Cap nhật người dùng
router.put(
  "/user",
  authMiddleware.authenticate,
  userController.updateCurrentUser
);
//cap quyen
router.patch(
  "/:id",
  authMiddleware.authenticate,
  authMiddleware.authorizeAdmin,
  userController.updateUser
);
//Gui email xac nhan
router.get("/verify-email/:token", userController.verifyEmail);
//Gui lai email xac nhan
router.post(
  "/resend-verification",
  authMiddleware.authenticate,
  userController.resendVerificationEmail
);
//Cam nguoi dung
router.post("/ban/:id", userController.verifyToken, userController.banUser);
//Huy cam
router.post("/unban/:id", userController.verifyToken, userController.unbanUser);

//Xóa người dùng
router.delete("/:id", authMiddleware.authenticate, userController.deleteUser);
//Xác thực token
router.get("/profile", userController.verifyToken, async (req, res) => {
  try {
    // Lấy thông tin người dùng từ req.user đã được set trong middleware
    const user = await UserSchema.findById(req.user._id);
    res.json({ status: true, user });
  } catch (err) {
    res
      .status(500)
      .json({ status: false, msg: "Failed to get user", error: err.message });
  }
});
// Route quên mật khẩu
router.post("/forgot-password", userController.forgotPassword);

// Route đặt lại mật khẩu
router.post("/reset-password/:token", userController.resetPassword);

// Kiểm tra quyen (admin access)
router.get(
  "/protected",
  authMiddleware.authenticate,
  authMiddleware.authorizeAdmin,
  (req, res) => {
    res.json({ status: true, msg: "You have admin access." });
  }
);

module.exports = router;
