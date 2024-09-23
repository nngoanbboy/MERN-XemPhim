import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link, Route, Routes } from "react-router-dom";
import config from "../../config";
import Spinner from "../../components/Spinner";

// Import các component con (giả sử bạn sẽ tạo các component này)
import GenreManagement from "./GenreManagement";
import CountryManagement from "./CountryManagement";
import MovieManagement from "./MovieManagement";
import UserManagement from "./UserManagement";
import ReportManagement from "./ReportManagement";
import ReportCommentManagement from "./ReportCommentManagement";
import DashboardStats from "./DashboardStats";

axios.defaults.withCredentials = true;
const AdminDashboard = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await axios.get(`${config.API_URL}/users/profile`);
        console.log(response.data);
        setIsLoggedIn(response.data.status === true);
        if (!response.data.status || !response.data.user.isAdmin) {
          navigate("/");
        }
      } catch (err) {
        setIsLoggedIn(false);
      }
    };
    checkLoginStatus();
  }, [navigate]);

  const Logout = async () => {
    try {
      await axios.get(`${config.API_URL}/users/logout`);
      setIsLoggedIn(false);
      navigate("/");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  if (!isLoggedIn) {
    return <Spinner />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="flex flex-col w-72 bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100 shadow-lg">
        <div className="flex items-center justify-center p-6 bg-gray-900">
          <span className="text-2xl font-semibold">Admin Dashboard</span>
        </div>
        <nav className="mt-6 flex-1">
          <Link
            to="/admin/stats"
            className="block py-3 px-6 text-gray-100 hover:bg-gray-700 hover:text-white transition duration-300"
          >
            Báo cáo dữ liệu Phim
          </Link>
          <Link
            to="/admin/genres"
            className="block py-3 px-6 text-gray-100 hover:bg-gray-700 hover:text-white transition duration-300"
          >
            Quản lý thể loại
          </Link>
          <Link
            to="/admin/countries"
            className="block py-3 px-6 text-gray-100 hover:bg-gray-700 hover:text-white transition duration-300"
          >
            Quản lý quốc gia
          </Link>
          <Link
            to="/admin/movies"
            className="block py-3 px-6 text-gray-100 hover:bg-gray-700 hover:text-white transition duration-300"
          >
            Quản lý phim
          </Link>
          <Link
            to="/admin/users"
            className="block py-3 px-6 text-gray-100 hover:bg-gray-700 hover:text-white transition duration-300"
          >
            Quản lý tài khoản
          </Link>
          <Link
            to="/admin/reports"
            className="block py-3 px-6 text-gray-100 hover:bg-gray-700 hover:text-white transition duration-300"
          >
            Quản lý báo lỗi
          </Link>
          <Link
            to="/admin/report-comments"
            className="block py-3 px-6 text-gray-100 hover:bg-gray-700 hover:text-white transition duration-300"
          >
            Quản lý báo cáo bình luận
          </Link>
        </nav>
        {/* Bottom Links */}
        <div className="mt-auto">
          <Link
            to="/"
            className="block py-3 px-6 text-gray-100 hover:bg-gray-700 hover:text-white transition duration-300"
          >
            Trang Chủ
          </Link>
          <button
            onClick={Logout}
            className="w-full py-3 px-6 text-left text-gray-100 bg-gray-800 hover:bg-gray-700 transition duration-300"
          >
            Đăng xuất
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 bg-white shadow-md rounded-lg overflow-auto">
        <Routes>
          <Route path="/stats" element={<DashboardStats />} />
          <Route path="/genres" element={<GenreManagement />} />
          <Route path="/countries" element={<CountryManagement />} />
          <Route path="/movies" element={<MovieManagement />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/reports" element={<ReportManagement />} />
          <Route
            path="/report-comments"
            element={<ReportCommentManagement />}
          />
          <Route
            path="/"
            element={
              <h1 className="text-3xl font-bold text-gray-800">
                Chào mừng đến với trang quản trị
              </h1>
            }
          />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;
