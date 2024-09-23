import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import config from "../../config";
import Spinner from "../../components/Spinner";
import NavBar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { FavoriteContext } from "../Auth/FavoriteContext";
import {
  FaPlay,
  FaHeart,
  FaRegHeart,
  FaUser,
  FaVideo,
  FaGlobe,
  FaCalendarAlt,
  FaHome,
  FaAngleRight,
  FaAlignJustify,
} from "react-icons/fa";

const Breadcrumb = (
  { items } //Phần hiển thị đường dẫn đến Phim
) => (
  <nav className="flex items-center text-sm text-gray-400 mb-4">
    <Link
      to="/"
      className="flex items-center hover:text-white transition duration-300"
    >
      <FaHome className="mr-1" />
      Trang Chủ
    </Link>
    {items.map((item, index) => (
      <React.Fragment key={index}>
        <FaAngleRight className="mx-2" />
        {item.link ? (
          <Link
            to={item.link}
            className="hover:text-white transition duration-300"
          >
            {item.label}
          </Link>
        ) : (
          <span className="text-white">{item.label}</span>
        )}
      </React.Fragment>
    ))}
  </nav>
);

const MovieDetails = () => {
  //Chi tết Phim
  const { duongdan } = useParams();
  const [movie, setMovie] = useState(null);
  const [category, setCategory] = useState("");
  const [country, setCountry] = useState("");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [movieType, setMovieType] = useState("");
  const { favorites, toggleFavorite } = useContext(FavoriteContext);
  const isFavorite = favorites.some((fav) => fav?._id === movie?._id);
  const [notification, setNotification] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [rating, setRating] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);

  useEffect(() => {
    const fetchMovieAndRatings = async () => {
      setIsLoading(true);
      try {
        // Fetch movie data
        const movieResponse = await axios.get(
          `${config.API_URL}/movies/duongdan/${duongdan}`
        );
        const movieData = movieResponse.data.movie;
        setMovie(movieData);
        if (movieData.category && movieData.category.length > 0) {
          setCategory(movieData.category[0]);
        }
        if (movieData.country && movieData.country.length > 0) {
          setCountry(movieData.country[0]);
        }
        setMovieType(movieData.type || "");

        // Fetch ratings
        if (movieData._id) {
          const ratingsResponse = await axios.get(
            `${config.API_URL}/movies/${movieData._id}/ratings`
          );
          const { averageRating, totalRatings } = ratingsResponse.data;
          setAverageRating(averageRating);
          setTotalRatings(totalRatings);
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching movie details or ratings:", error);
        setIsLoading(false);
      }
    };

    fetchMovieAndRatings();
  }, [duongdan]);
  const fetchRatings = async () => {
    try {
      const response = await axios.get(
        `${config.API_URL}/movies/${movie._id}/ratings`
      );
      const { averageRating, totalRatings } = response.data;
      setAverageRating(averageRating);
      setTotalRatings(totalRatings);
    } catch (error) {
      console.error("Error fetching ratings:", error);
    }
  };
  const handleRating = async (ratingValue) => {
    if (!isLoggedIn) {
      alert("Bạn cần đăng nhập để đánh giá phim.");
      return;
    }

    try {
      await axios.post(`${config.API_URL}/movies/${movie._id}/ratings`, {
        rating: ratingValue,
      });
      setUserRating(ratingValue);
      fetchRatings(); // Cập nhật rating sau khi đánh giá
    } catch (error) {
      console.error("Error submitting rating:", error);
    }
  };
  const RatingStars = ({ rating, totalRatings, userRating, onRate }) => {
    return (
      <div className="flex items-center space-x-2">
        <div className="flex">
          {[...Array(10)].map((_, i) => (
            <span
              key={i}
              className="text-2xl cursor-pointer"
              onClick={() => onRate(i + 1)}
            >
              {i < (userRating || Math.floor(rating)) ? (
                <span className="text-yellow-400">★</span>
              ) : (
                <span className="text-gray-400">☆</span>
              )}
            </span>
          ))}
        </div>
        <span className="text-2xl font-bold text-white">
          {rating.toFixed(1)}
        </span>
        <span className="text-gray-400">({totalRatings} đánh giá)</span>
        {userRating > 0 && (
          <span className="text-green-400">Bạn đã đánh giá: {userRating}</span>
        )}
      </div>
    );
  };
  const checkUserStatus = async () => {
    //Kiểm tra trạng thái đăng nhập
    try {
      const response = await axios.get(`${config.API_URL}/users/profile`);
      console.log("User data:", response.data); // In ra dữ liệu người dùng
      setIsLoggedIn(response.data.status === true);
    } catch (err) {
      console.error("Failed to fetch user status", err);
      setIsLoggedIn(false);
    }
  };

  useEffect(() => {
    checkUserStatus();
  }, []);

  const getBreadcrumbItems = () => {
    //Lấy đường dẫn đến Phim
    let items = [];

    if (movieType === "series") {
      items.push({ label: "Phim Bộ", link: "/phim-bo" });
    } else if (movieType === "single") {
      items.push({ label: "Phim Lẻ", link: "/phim-le" });
    }

    if (country && country.name) {
      items.push({ label: country.name, link: `/quoc-gia/${country.slug}` });
    }

    if (category && category.name) {
      items.push({ label: category.name, link: `/the-loai/${category.slug}` });
    }

    items.push({ label: movie.name });

    return items;
  };

  if (isLoading) return <Spinner />;
  if (!movie) return <div>Movie not found</div>;

  const handleWatchMovie = () => navigate(`/xem-phim/${duongdan}`); //Dẫn đến trang xem phim

  return (
    //Giao diện
    <div className="bg-gray-900 text-gray-300 min-h-screen">
      <NavBar />
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb items={getBreadcrumbItems()} />
        <div className="flex flex-col lg:flex-row">
          {/* Poster Phim */}
          <div className="lg:w-1/3 mb-8 lg:mb-0">
            <img
              src={movie.thumb_url}
              alt={movie.name}
              className="w-full rounded-lg shadow-lg"
            />
          </div>

          {/* Thông Tin Phim */}
          <div className="lg:w-2/3 lg:pl-8">
            <h1 className="text-4xl font-bold text-white mb-4">{movie.name}</h1>
            <p className="text-xl text-gray-400 mb-6">{movie.name} (VIETSUB)</p>

            <div className="flex flex-wrap gap-4 mb-6">
              <button
                onClick={handleWatchMovie}
                className="flex items-center bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-full transition duration-300"
              >
                <FaPlay className="mr-2" /> Xem Phim
              </button>
              <button
                onClick={() => {
                  if (!isLoggedIn) {
                    alert("Bạn phải đăng nhập để thực hiện thao tác này.");
                    return;
                  }
                  toggleFavorite(movie._id);
                }}
                className={`flex items-center ${
                  isFavorite
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-gray-600 hover:bg-gray-700"
                } text-white px-6 py-3 rounded-full transition duration-300`}
              >
                {isFavorite ? (
                  <FaHeart className="mr-2" />
                ) : (
                  <FaRegHeart className="mr-2" />
                )}
                {isFavorite ? "Bỏ Yêu thích" : "Yêu thích"}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-y-4 text-sm">
              <InfoItem
                icon={<FaVideo />}
                label="Trạng thái"
                value={movie.episode_current}
              />
              <InfoItem
                icon={<FaVideo />}
                label="Số tập"
                value={movie.episode_total}
              />
              <InfoItem
                icon={<FaCalendarAlt />}
                label="Năm Phát Hành"
                value={movie.year}
              />
              <InfoItem
                icon={<FaVideo />}
                label="Chất Lượng"
                value={movie.quality}
              />
              <InfoItem
                icon={<FaGlobe />}
                label="Quốc Gia"
                value={
                  movie.country?.map((c) => c.name).join(", ") ||
                  "Không xác định"
                }
              />
              <InfoItem
                icon={<FaGlobe />}
                label="Ngôn Ngữ"
                value={movie.lang}
              />
              <InfoItem
                icon={<FaUser />}
                label="Đạo Diễn"
                value={movie.director?.join(", ") || "Không có thông tin"}
              />
              <InfoItem
                icon={<FaAlignJustify />}
                label="Thể Loại"
                value={
                  movie.category && movie.category.length > 0 ? (
                    <CategoryLinks categories={movie.category} />
                  ) : (
                    "Không có thể loại"
                  )
                }
              />
            </div>

            <div className="mt-6">
              <h3 className="text-xl font-semibold text-white mb-2">
                Diễn Viên
              </h3>
              <div className="flex flex-wrap gap-2">
                {movie.actor?.map((actor, index) => (
                  <span
                    key={index}
                    className="bg-gray-700 text-white rounded-full px-3 py-1 text-sm"
                  >
                    {actor}
                  </span>
                ))}
              </div>
            </div>
            {/* Rating */}
            <div className="mt-6">
              <h3 className="text-xl font-semibold text-white mb-2">
                Đánh giá
              </h3>
              <RatingStars
                rating={averageRating}
                totalRatings={totalRatings}
                userRating={userRating}
                onRate={handleRating}
              />
            </div>
          </div>
        </div>

        {/* Nội dung */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-4">Nội dung phim</h2>
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            {movie.content ? (
              <div
                dangerouslySetInnerHTML={{ __html: movie.content }}
                className="text-gray-300"
              />
            ) : (
              <p className="text-gray-400">Đang Cập Nhật. . .</p>
            )}
          </div>
          {/*  Trailer */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-4">Trailer</h2>
            {movie.trailer_url ? (
              <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
                {" "}
                {/* 16:9 Aspect Ratio */}
                <iframe
                  src={movie.trailer_url.replace("watch?v=", "embed/")}
                  title="Movie Trailer"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute top-0 left-0 w-full h-full rounded-lg"
                ></iframe>
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg p-6 shadow-lg text-center">
                <p className="text-gray-400">Đang Cập Nhật!</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

const CategoryLinks = ({ categories }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => (
        <Link
          key={cat._id}
          to={`/the-loai/${cat.slug}`}
          className="bg-gray-700 text-white rounded-full px-3 py-1 text-sm hover:bg-gray-600 transition duration-300"
        >
          {cat.name}
        </Link>
      ))}
    </div>
  );
};

const InfoItem = ({ icon, label, value }) => (
  <div className="flex items-center">
    <span className="text-purple-400 mr-2">{icon}</span>
    <span className="font-semibold mr-2">{label}:</span>
    <span>{value}</span>
  </div>
);

export default MovieDetails;
