import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Auth/Home";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import MovieDetails from "./pages/Auth/MovieDetail";
import UserProfileUpdate from "./pages/Auth/UserProfileUpdate";
import MovieByGenre from "./pages/Auth/MovieByGenre";
import MovieByCountry from "./pages/Auth/MovieByCountry";
import SingleMovie from "./pages/Auth/SingleMovie";
import SeriesMovie from "./pages/Auth/SeriesMovie";
import WatchMovie from "./pages/Auth/WatchMovie";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import SearchPage from "./pages/Auth/SearchPage";
import FavoriteMovie from "./pages/Auth/FavoriteMovie";
import { FavoriteProvider } from "./pages/Auth/FavoriteContext";
import VerifyEmail from "./pages/Auth/VerifyEmail";
import MovieHistory from "./pages/Auth/MovieHistory";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";

const App = () => {
  // thiết lập các tuyến đường (routes) cho Website
  return (
    <>
      <FavoriteProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/register" element={<Register />} />
          <Route path="/detail/:duongdan" element={<MovieDetails />} />
          <Route path="/the-loai/:slug" element={<MovieByGenre />} />
          <Route path="/quoc-gia/:slug" element={<MovieByCountry />} />
          <Route path="/phim-le" element={<SingleMovie />} />
          <Route path="/phim-bo" element={<SeriesMovie />} />
          <Route path="/xem-phim/:duongdan" element={<WatchMovie />} />
          <Route path="/xem-phim/:duongdan/:tap?" element={<WatchMovie />} />
          <Route path="/profile" element={<UserProfileUpdate />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/favorites" element={<FavoriteMovie />} />
          <Route path="/history" element={<MovieHistory />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
        </Routes>
      </FavoriteProvider>
    </>
  );
};

export default App;
