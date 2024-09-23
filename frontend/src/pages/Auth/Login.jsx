import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import config from "../../config.js";
import { Link } from "react-router-dom";
//Đăng nhập
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    //Lấy dữ liệu khi đăng nhập
    e.preventDefault();
    try {
      const response = await axios.post(
        `${config.API_URL}/users/login`,
        {
          email: email,
          password: password,
        },
        { withCredentials: true }
      );

      navigate("/");
    } catch (err) {
      console.error("Login failed", err);
      if (err.response && err.response.status === 403) {
        // Kiểm tra xem có phải lỗi 403 (Forbidden) không
        if (err.response.data && err.response.data.msg) {
          // Nếu server trả về thông báo cụ thể, hiển thị nó
          setErrorMessage(err.response.data.msg);
        } else {
          // Nếu không có thông báo cụ thể, hiển thị thông báo mặc định về tài khoản bị cấm
          setErrorMessage(
            "Tài khoản của bạn đang bị cấm. Vui lòng liên hệ quản trị viên."
          );
        }
      } else {
        // Các lỗi khác
        setErrorMessage("Sai thông tin đăng nhập Vui lòng thử lại.");
      }
    }
  };

  return (
    //Hien thi giao dien
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            ĐĂNG NHẬP
          </h2>
        </div>
        {errorMessage && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <span className="block sm:inline">{errorMessage}</span>
          </div>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <input type="hidden" name="remember" value="true" />
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Quên mật khẩu?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              XÁC NHẬN
            </button>
          </div>
          <Link
            to="/"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Trang Chủ
          </Link>
        </form>
      </div>
    </div>
  );
};

export default Login;
