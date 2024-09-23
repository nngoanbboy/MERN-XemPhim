// controllers/userController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const crypto = require("crypto");
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require("../utils/emailService");

// Đăng ký người dùng
exports.registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res
        .status(400)
        .json({ status: false, msg: "Username already taken" });
    }
    const existingUserEmail = await User.findOne({ email });
    if (existingUserEmail) {
      return res
        .status(400)
        .json({ status: false, msg: "Email already taken" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    res.json({ status: true, msg: "User registered successfully" });
  } catch (err) {
    res.status(500).json({
      status: false,
      msg: "Failed to register user",
      error: err.message,
    });
  }
};

// Đăng nhap người dùng
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!email) {
      return res.status(400).json({ status: false, msg: "Invalid email " });
    }
    // Kiểm tra trạng thái cấm
    if (user.isBanned) {
      if (user.banExpiresAt > new Date()) {
        return res.status(403).json({
          status: false,
          msg:
            "Tài khoản của bạn đang tạm thời bị khóa sẽ mở khóa sau: " +
            user.banExpiresAt,
        });
      } else {
        // Nếu thời gian cấm đã hết, tự động bỏ cấm
        user.isBanned = false;
        user.banExpiresAt = null;
        await user.save();
      }
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ status: false, msg: "Sai mật khẩu" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { _id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "6h" }
    );
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 6 * 60 * 60 * 1000,
      sameSite: "Lax",
      secure: true,
    });
    res.json({ status: true, msg: "User Login successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ status: false, msg: "Failed to login", error: err.message });
  }
};

// Đăng xuất người dùng
exports.logoutUser = async (req, res) => {
  try {
    res.clearCookie("token");
    res.json({ status: true, msg: "Logout successful" });
  } catch (err) {
    res
      .status(500)
      .json({ status: false, msg: "Failed to logout", error: err.message });
  }
};
// Lấy dữ liệu tất ca người dùng
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}); // Exclude password from the result
    res.json({ status: true, users });
  } catch (err) {
    res
      .status(500)
      .json({ status: false, msg: "Failed to get users", error: err.message });
  }
};

// Lấy dữ liệu người dùng đang đăng nhap
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json({ status: true, user });
  } catch (err) {
    res
      .status(500)
      .json({ status: false, msg: "Failed to get user", error: err.message });
  }
};
//Cap nhat thong tin nguoi dung hien tai
exports.updateCurrentUser = async (req, res) => {
  try {
    // Lấy thông tin người dùng từ req.body
    const { username, password } = req.body;

    // Kiểm tra xem req.user._id có tồn tại
    if (!req.user._id) {
      return res.status(403).json({ status: false, msg: "Unauthorized" });
    }

    // Tạo một đối tượng updateData chỉ chứa những trường cần cập nhật
    let updateData = {};

    // Nếu có username, thêm vào updateData
    if (username) {
      updateData.username = username;
    }

    // Nếu có cập nhật mật khẩu, hash lại mật khẩu mới và thêm vào updateData
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    // Cập nhật thông tin người dùng chỉ với những trường trong updateData
    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
    });

    // Trả về kết quả
    res.json({ status: true, user });
  } catch (err) {
    res.status(500).json({
      status: false,
      msg: "Failed to update user",
      error: err.message,
    });
  }
};
// Kiem tra token
exports.verifyToken = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res
      .status(401)
      .json({ status: false, msg: "Access Denied. No token provided." });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Lưu thông tin user đã được giải mã từ token vào req.user
    next(); // Chuyển tiếp sang middleware hoặc route tiếp theo
  } catch (err) {
    return res.status(401).json({ status: false, msg: "Invalid token." });
  }
};
//Xóa người dùng
exports.deleteUser = async (req, res) => {
  try {
    const userToDelete = await User.findById(req.params.id);
    if (!userToDelete) {
      return res
        .status(404)
        .json({ status: false, msg: "User not found before deletion" });
    }

    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res
        .status(404)
        .json({ status: false, msg: "User not found during deletion" });
    }

    res.json({ status: true, msg: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({
      status: false,
      msg: "Failed to delete user",
      error: err.message,
    });
  }
};
// Lấy dữ liệu người dùng theo ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    res.json({ status: true, user });
  } catch (err) {
    res
      .status(500)
      .json({ status: false, msg: "Failed to get user", error: err.message });
  }
};
// Cap nhat thong tin nguoi dung
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { isAdmin } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { isAdmin },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ status: false, msg: "User not found" });
    }

    res.json({
      status: true,
      msg: "User updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({
      status: false,
      msg: "Failed to update user",
      error: err.message,
    });
  }
};
// Xac nhan email
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res
        .status(400)
        .json({ status: false, msg: "Invalid or expired verification token" });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({ status: true, msg: "Email verified successfully" });
  } catch (err) {
    // Xử lý lỗi
  }
};
// Gui lai email xac nhan
exports.resendVerificationEmail = async (req, res) => {
  try {
    console.log("Resend verification email request received");
    const user = await User.findById(req.user._id);
    console.log("User found:", user);

    if (!user) {
      console.log("User not found");
      return res.status(404).json({ status: false, msg: "User not found" });
    }

    if (user.isVerified) {
      return res
        .status(400)
        .json({ status: false, msg: "Email is already verified" });
    }

    const verificationToken = crypto.randomBytes(20).toString("hex");
    user.verificationToken = verificationToken;
    await user.save();
    console.log("New verification token saved");

    await sendVerificationEmail(user.email, verificationToken);
    console.log("Verification email sent");

    res.json({ status: true, msg: "Verification email sent successfully" });
  } catch (err) {
    console.error("Error resending verification email:", err);
    res.status(500).json({
      status: false,
      msg: "Failed to resend verification email",
      error: err.message,
    });
  }
};
// Cấm nguoi dung
exports.banUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { banDuration } = req.body; // Thời gian cấm tính bằng giờ

    const banExpiresAt = new Date(Date.now() + banDuration * 60 * 60 * 1000);

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { isBanned: true, banExpiresAt },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ status: false, msg: "User not found" });
    }

    res.json({
      status: true,
      msg: "User banned successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Error banning user:", err);
    res
      .status(500)
      .json({ status: false, msg: "Failed to ban user", error: err.message });
  }
};
// Bỏ cấm nguoi dung
exports.unbanUser = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { isBanned: false, banExpiresAt: null },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ status: false, msg: "User not found" });
    }

    res.json({
      status: true,
      msg: "User unbanned successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Error unbanning user:", err);
    res
      .status(500)
      .json({ status: false, msg: "Failed to unban user", error: err.message });
  }
};
// Quên mật khẩu
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ status: false, msg: "Không tìm thấy tài khoản với email này" });
    }

    // Tạo token đặt lại mật khẩu
    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // Token có hiệu lực trong 15 phút

    await user.save();

    // Tạo URL đặt lại mật khẩu cho frontend
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Gửi email chứa link đặt lại mật khẩu
    await sendPasswordResetEmail(user.email, resetToken);

    res.json({ status: true, msg: "Email đặt lại mật khẩu đã được gửi" });
  } catch (err) {
    console.error("Lỗi khi xử lý quên mật khẩu:", err);
    res.status(500).json({
      status: false,
      msg: "Không thể gửi email đặt lại mật khẩu",
      error: err.message,
    });
  }
};

// Đặt lại mật khẩu
exports.resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ status: false, msg: "Token không hợp lệ hoặc đã hết hạn" });
    }

    // Đặt mật khẩu mới
    user.password = await bcrypt.hash(req.body.password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({ status: true, msg: "Mật khẩu đã được đặt lại thành công" });
  } catch (err) {
    console.error("Lỗi khi đặt lại mật khẩu:", err);
    res.status(500).json({
      status: false,
      msg: "Không thể đặt lại mật khẩu",
      error: err.message,
    });
  }
};
