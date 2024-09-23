import React from "react";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import axios from "axios";
import config from "../config";
import { useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";

const NavBar = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // Trạng thái admin
  const [genres, setGenres] = useState([]);
  const [countries, setCountries] = useState([]);
  const location = useLocation();
  const [showGenreDropdown, setShowGenreDropdown] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showOptionsDropdown, setShowOptionsDropdown] = useState(false); // Trạng thái dropdown Tùy chọn

  axios.defaults.withCredentials = true;
  const checkUserStatus = async () => {
    try {
      const response = await axios.get(`${config.API_URL}/users/profile`);

      console.log("User data:", response.data); // In ra dữ liệu người dùng
      setIsLoggedIn(response.data.status === true);
      setIsAdmin(response.data.user.isAdmin || false); // Xác định người dùng có phải là admin
    } catch (err) {
      console.error("Failed to fetch user status", err);
      setIsLoggedIn(false);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    checkUserStatus();
  }, []);

  const Logout = async () => {
    try {
      await axios.get(`${config.API_URL}/users/logout`);
      setIsLoggedIn(false);
      setIsAdmin(false);

      if (location.pathname === "/") {
        // Nếu đang ở trang chủ, reload trang
        window.location.reload();
      } else {
        // Nếu không, chuyển hướng về trang chủ
        navigate("/");
      }
    } catch (err) {
      console.error("Logout failed", err);
    }
  };
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await axios.get(`${config.API_URL}/users/profile`);
        setIsLoggedIn(response.data.status === true);
        setIsLoading(false);
      } catch (err) {}
    };
    checkLoginStatus();
  }, []); // Chỉ chạy một lần khi component mount

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await axios.get(`${config.API_URL}/genres`);
        setGenres(response.data.genres);
      } catch (err) {
        console.error("Failed to fetch genres", err);
      }
    };
    fetchGenres();
  }, []); // Chỉ chạy một lần khi component mount

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get(`${config.API_URL}/countries`);
        if (Array.isArray(response.data)) {
          setCountries(response.data);
        } else if (
          response.data.countries &&
          Array.isArray(response.data.countries)
        ) {
          setCountries(response.data.countries);
        } else {
          console.error("Unexpected API response format:", response.data);
          setCountries([]);
        }
      } catch (error) {
        console.error("Failed to fetch countries", error);
        setCountries([]);
      }
    };
    fetchCountries();
  }, []); // Chỉ chạy một lần khi component mount
  const [timerId, setTimerId] = useState(null);
  const [countryTimerId, setCountryTimerId] = useState(null);
  const handleMouseEnter = () => {
    clearTimeout(timerId); // Xóa timeout cũ nếu có
    setShowGenreDropdown(true);
  };
  const handleMouseLeave = () => {
    // Đặt timeout mới để đóng dropdown sau 10 giây khi rời khỏi vùng
    const id = setTimeout(() => {
      setShowGenreDropdown(false);
    }, 50); // 1 giây

    setTimerId(id); // Lưu lại id của timeout
  };
  const handleCountryMouseEnter = () => {
    clearTimeout(countryTimerId);
    setShowCountryDropdown(true);
  };

  const handleCountryMouseLeave = () => {
    const id = setTimeout(() => {
      setShowCountryDropdown(false);
    }, 50);
    setCountryTimerId(id);
  };
  const handleOptionsMouseEnter = () => {
    clearTimeout(countryTimerId);
    setShowOptionsDropdown(true);
  };

  const handleOptionsMouseLeave = () => {
    const id = setTimeout(() => {
      setShowOptionsDropdown(false);
    }, 50);
    setCountryTimerId(id);
  };

  return (
    <nav className="bg-black text-white p-4 flex justify-between items-center">
      <div className="flex items-center space-x-8">
        <a href="/">
          <img src="/netflix.png" alt="Netflix" className="h-10 w-10" />{" "}
        </a>
        <ul className="flex space-x-4">
          <li>
            <Link to="/" className="hover:text-gray-300">
              Trang Chủ
            </Link>
          </li>
          <li>
            <Link to="/phim-le" className="hover:text-gray-300">
              Phim Lẻ
            </Link>
          </li>
          <li>
            <Link to="/phim-bo" className="hover:text-gray-300">
              Phim Bộ
            </Link>
          </li>
          <li>
            <div
              className="relative"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <span className="hover:text-gray-300 cursor-pointer">
                Thể Loại
              </span>
              {showGenreDropdown && (
                <div className="absolute left-0 mt-2 bg-black rounded-md shadow-lg py-1 z-10 grid grid-cols-3 min-w-[30rem]">
                  {genres.map((genre) => (
                    <Link
                      key={genre._id}
                      to={`/the-loai/${genre.slug}`}
                      className="block px-5 py-2 text-sm text-gray-300 hover:bg-gray-800"
                    >
                      {genre.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </li>
          <li>
            <div
              className="relative"
              onMouseEnter={handleCountryMouseEnter}
              onMouseLeave={handleCountryMouseLeave}
            >
              <span className="hover:text-gray-300 cursor-pointer">
                Quốc Gia
              </span>
              {showCountryDropdown && (
                <div className="absolute left-0 mt-2 bg-black rounded-md shadow-lg py-1 z-10 grid grid-cols-3 min-w-[30rem]">
                  {countries.map((country) => (
                    <Link
                      key={country._id}
                      to={`/quoc-gia/${country.slug}`}
                      className="block px-5 py-2 text-sm text-gray-300 hover:bg-gray-800"
                    >
                      {country.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </li>
        </ul>
      </div>
      <div className="flex items-center space-x-4">
        {isLoggedIn ? (
          <div
            className="relative"
            onMouseEnter={handleOptionsMouseEnter}
            onMouseLeave={handleOptionsMouseLeave}
          >
            <span className="hover:text-gray-300 cursor-pointer">Tùy chọn</span>
            {showOptionsDropdown && (
              <div className="absolute right-0 mt-2 bg-black rounded-md shadow-lg py-1 z-10 min-w-[16rem] text-base">
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="block px-6 py-3 text-gray-300 hover:bg-gray-800"
                  >
                    Quản Lý
                  </Link>
                )}
                <Link
                  to="/history"
                  className="block px-6 py-3 text-gray-300 hover:bg-gray-800"
                >
                  Lịch Sử Xem
                </Link>
                <Link
                  to="/favorites"
                  className="block px-6 py-3 text-gray-300 hover:bg-gray-800"
                >
                  Phim yêu thích
                </Link>
                <button
                  onClick={Logout}
                  className="block w-full text-left px-6 py-3 text-gray-300 hover:bg-gray-800"
                >
                  Đăng Xuất
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link to="/login" className="hover:text-gray-300">
              Đăng Nhập
            </Link>
            <Link to="/register" className="hover:text-gray-300">
              Đăng Ký
            </Link>
          </>
        )}
        <Link to="/search" className="hover:text-gray-300">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </Link>
        {isLoggedIn && (
          <Link to="/profile" className="hover:text-gray-300">
            <img
              src="/Profile.jpg"
              alt="Profile"
              className="w-8 h-8 rounded mx-2"
            />
            Profile
          </Link>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
