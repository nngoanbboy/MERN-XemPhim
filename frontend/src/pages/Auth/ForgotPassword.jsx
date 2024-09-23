import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import config from "../../config.js";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${config.API_URL}/users/forgot-password`,
        { email }
      );
      setMessage(response.data.msg);
      setIsError(false);
    } catch (err) {
      setMessage(err.response?.data?.msg || "Có lỗi xảy ra. Vui lòng thử lại.");
      setIsError(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Quên Mật Khẩu
          </h2>
        </div>
        {message && (
          <div
            className={`${
              isError
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            } px-4 py-3 rounded relative`}
            role="alert"
          >
            <span className="block sm:inline">{message}</span>
          </div>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Gửi Yêu Cầu Đặt Lại Mật Khẩu
            </button>
          </div>
        </form>
        <div className="text-sm text-center">
          <Link
            to="/login"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Quay lại trang đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
