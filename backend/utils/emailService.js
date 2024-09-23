const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
//Gui email xac thuc
exports.sendVerificationEmail = (to, token) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: "Email Verification",
    html: `<p>Click <a href="${process.env.FRONTEND_URL}/verify-email/${token}">here</a> to verify your email.</p>`,
  };

  return transporter.sendMail(mailOptions);
};

// Gửi email quên mật khẩu
exports.sendPasswordResetEmail = (to, token) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: "Gửi Yêu Cầu Reset Password  ",
    html: `
      <h1>Bạn muốn reset Mật Khẩu ?</h1>
      <p>Vui lòng nhấn vào link bên dưới để gửi email thay đổi mật khẩu:</p>
      <a href="${process.env.FRONTEND_URL}/reset-password/${token}">Reset Password</a>
      <p>Link sẽ hết hạn trong 15 phút.</p>
      <p>Nếu bạn bỏ qua mail này mật khẩu hiện tại sẽ giữ nguyên</p>
    `,
  };

  return transporter.sendMail(mailOptions);
};
