import React from "react";
import { Link } from "react-router-dom";
import NavBar from "../../components/Navbar.jsx";
import axios from "axios";
import NetflixHomePage from "./HomePageMain";
//Các thành phần ở trang chủ
const Home = () => {
  // Đặt cấu hình của axios để bao gồm cookie trong các yêu cầu HTTP
  axios.withCredentials = true;

  return (
    // Trả về JSX để hiển thị giao diện
    <div>
      <NavBar />
      <NetflixHomePage />
    </div>
  );
};

export default Home;
