import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import config from "../../config";
import Spinner from "../../components/Spinner";
import NavBar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useNavigate, useLocation } from "react-router-dom";
import { FavoriteContext } from "../Auth/FavoriteContext";
import ScrollToTopButton from "../../components/ScrollToTopButton.jsx";
import {
  FaHeart,
  FaRegHeart,
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaEdit,
  FaTrash,
  FaFlag,
} from "react-icons/fa";

const StarRating = ({ rating }) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  // Add full stars
  for (let i = 0; i < fullStars; i++) {
    stars.push(<FaStar key={`star-${i}`} className="text-yellow-400" />);
  }

  // Add half star if necessary
  if (hasHalfStar) {
    stars.push(<FaStarHalfAlt key="half-star" className="text-yellow-400" />);
  }

  // Add empty stars
  for (let i = 0; i < emptyStars; i++) {
    stars.push(<FaRegStar key={`empty-star-${i}`} className="text-gray-400" />);
  }

  return (
    <div className="flex items-center">
      {stars}
      <span className="ml-1 text-sm text-gray-400">{rating.toFixed(1)}</span>
    </div>
  );
};
axios.defaults.withCredentials = true;
// Phần Xem phim
const WatchMovie = () => {
  const { duongdan, tap } = useParams();
  const [movie, setMovie] = useState(null);
  const [suggestedMovies, setSuggestedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentServer, setCurrentServer] = useState(0);
  const [currentEpisode, setCurrentEpisode] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [movieType, setMovieType] = useState("");
  const [country, setCountry] = useState("");
  const [category, setCategory] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const { toggleFavorite } = useContext(FavoriteContext);
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [notification, setNotification] = useState("");
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportDescription, setReportDescription] = useState("");
  const [showReportCommentModal, setShowReportCommentModal] = useState(false);
  const [reportCommentReason, setReportCommentReason] = useState("");
  const [commentToReport, setCommentToReport] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const location = useLocation();

  const addToHistory = async (movieId) => {
    //Thêm vào lịch sử xem phim
    try {
      await axios.post(
        `${config.API_URL}/movies/history`,
        { movieId },
        { withCredentials: true }
      );
    } catch (error) {
      console.error("Failed to add to history:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [movieResponse, suggestedResponse] = await Promise.all([
          axios.get(`${config.API_URL}/movies/duongdan/${duongdan}`),
          axios.get(`${config.API_URL}/movies/suggested`),
        ]);
        setMovie(movieResponse.data.movie);
        console.log(movieResponse.data.movie);
        if (tap) {
          const episodeIndex =
            movieResponse.data.movie.episodes[0].server_data.findIndex(
              (episode) => episode.slug === tap.replace("tap-", "")
            );
          if (episodeIndex !== -1) {
            setCurrentEpisode(episodeIndex);
          }
        } else {
          setCurrentEpisode(0);
        }

        // Fetch ratings for suggested movies
        const moviesWithRatings = await Promise.all(
          suggestedResponse.data.movies.map(async (movie) => {
            const ratingResponse = await axios.get(
              `${config.API_URL}/movies/${movie._id}/ratings`
            );
            return {
              ...movie,
              averageRating: ratingResponse.data.averageRating,
            };
          })
        );

        setSuggestedMovies(moviesWithRatings);

        setMovieType(movieResponse.data.movie.type || "");
        setCountry(
          movieResponse.data.movie.country &&
            movieResponse.data.movie.country.length > 0
            ? movieResponse.data.movie.country[0]
            : {}
        );
        setCategory(
          movieResponse.data.movie.category &&
            movieResponse.data.movie.category.length > 0
            ? movieResponse.data.movie.category[0]
            : {}
        );
        if (movieResponse.data.movie._id) {
          addToHistory(movieResponse.data.movie._id);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [duongdan, tap]);
  useEffect(() => {
    //tìm kiếm tập phim tương ứng trong danh sách episodes và cập nhật currentEpisode
    if (movie && movie.episodes) {
      const paths = location.pathname.split("/");
      const currentTap = paths[paths.length - 1];
      if (currentTap.startsWith("tap-")) {
        const episodeSlug = currentTap.replace("tap-", "");
        const episodeIndex = movie.episodes[
          currentServer
        ].server_data.findIndex((episode) => episode.slug === episodeSlug);
        if (episodeIndex !== -1) {
          setCurrentEpisode(episodeIndex);
        }
      }
    }
  }, [location, movie, currentServer]);
  const handleEpisodeSelect = (index, episodeSlug) => {
    setCurrentEpisode(index);
    navigate(`/xem-phim/${duongdan}/tap-${episodeSlug}`, { replace: true });
  }; //điều hướng người dùng đến URL mới tương ứng với tập phim đã chọn
  const checkUserStatus = async () => {
    //Kiểm tra thông tin người dùng hiện tại
    try {
      const response = await axios.get(`${config.API_URL}/users/profile`, {
        withCredentials: true,
      });
      console.log("User data:", response.data); // In ra dữ liệu người dùng
      setIsLoggedIn(response.data.status === true);
      if (response.data.status === true) {
        setCurrentUser(response.data.user);
      }
    } catch (err) {
      console.error("Failed to fetch user status", err);
      setIsLoggedIn(false);
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    checkUserStatus();
  }, []);

  const fetchComments = async () => {
    //Lấy dữ liệu bình luận
    if (movie) {
      try {
        const response = await axios.get(
          `${config.API_URL}/comments/${movie._id}`
        );
        setComments(response.data.comments);
      } catch (error) {
        console.error("Failed to fetch comments:", error);
      }
    }
  };

  const handleReportComment = async () => {
    //Gửi báo cáo bình luận
    if (isLoggedIn) {
      try {
        console.log("Sending report with data:", {
          commentId: commentToReport._id,
          reason: reportCommentReason,
        });

        const response = await axios.post(
          `${config.API_URL}/report-comments/${commentToReport._id}`,
          { reason: reportCommentReason },
          {
            withCredentials: true,
          }
        );

        console.log("Report response:", response.data);

        setNotification("Bình luận đã được báo cáo thành công!");
        setShowReportCommentModal(false);
        setReportCommentReason("");
        setCommentToReport(null);
      } catch (error) {
        console.error(
          "Lỗi khi báo cáo bình luận:",
          error.response?.data || error.message
        );
        setNotification(
          "Có lỗi xảy ra khi báo cáo bình luận. Vui lòng thử lại sau."
        );
      }
    } else {
      setNotification("Bạn phải đăng nhập để thực hiện thao tác này!");
    }
  };
  const handleAddComment = async () => {
    //Gửi binh luận
    if (isLoggedIn) {
      if (movie) {
        try {
          const response = await axios.post(
            `${config.API_URL}/comments/${movie._id}`,
            { comment: commentText },
            { withCredentials: true }
          );
          setComments([response.data.comment, ...comments]);
          setCommentText("");
        } catch (error) {
          console.error("Failed to add comment:", error);
        }
      }
    } else {
      setNotification("Bạn phải đăng nhập để thực hiện thao tác này !!");
      console.log("Notification set");
      setTimeout(() => setNotification(""), 3000); // Xóa thông báo sau 3 giây
    }
  };
  const handleEditComment = async (commentId) => {
    if (isLoggedIn) {
      try {
        const response = await axios.put(
          `${config.API_URL}/comments/${commentId}`,
          { comment: editCommentText },
          { withCredentials: true }
        );
        const updatedComments = comments.map((c) =>
          c._id === commentId ? response.data.comment : c
        );
        setComments(updatedComments);
        setEditingCommentId(null);
        setEditCommentText("");
      } catch (error) {
        console.error("Failed to edit comment:", error);
        setNotification("Có lỗi xảy ra khi sửa bình luận.");
      }
    } else {
      setNotification("Bạn phải đăng nhập để thực hiện thao tác này!");
    }
  };
  const handleDeleteComment = async (commentId) => {
    if (isLoggedIn) {
      try {
        await axios.delete(`${config.API_URL}/comments/${commentId}`, {
          withCredentials: true,
        });
        setComments(comments.filter((c) => c._id !== commentId));
      } catch (error) {
        console.error("Failed to delete comment:", error);
        setNotification("Có lỗi xảy ra khi xóa bình luận.");
      }
    } else {
      setNotification("Bạn phải đăng nhập để thực hiện thao tác này!");
    }
  };
  useEffect(() => {
    if (movie) {
      fetchComments();
      checkFavoriteStatus();
    }
  }, [movie]);
  const handleReportIssue = async () => {
    //Gửi báo cáo lỗi
    if (isLoggedIn) {
      try {
        const response = await axios.post(
          `${config.API_URL}/reports`,
          {
            movieId: movie._id,
            episodeNumber: episodeData.name,
            description: reportDescription,
          },
          {
            withCredentials: true,
          }
        );

        setNotification("Báo cáo lỗi đã được gửi thành công!");
        setShowReportModal(false);
        setReportDescription("");
        console.log("Report response:", response.data);
      } catch (error) {
        console.error("Lỗi khi gửi báo cáo:", error);
        if (error.response) {
          setNotification(
            `Lỗi: ${
              error.response.data.message || "Có lỗi xảy ra khi gửi báo cáo"
            }`
          );
        } else {
          setNotification("Có lỗi xảy ra. Vui lòng thử lại sau.");
        }
      }
    } else {
      setNotification("Bạn phải đăng nhập để thực hiện thao tác này !!");
      setTimeout(() => setNotification(""), 3000); // Xóa thông báo sau 3 giây
    }
  };

  const handleHomeClick = () => navigate("/"); //Điều hướng đến trang chủ
  const handleCountryClick = () =>
    country && country.slug && navigate(`/quoc-gia/${country.slug}`); //Điều hướng đến trang phim theo quốc gia
  const handleCategoryClick = () =>
    category && category.slug && navigate(`/the-loai/${category.slug}`); //Điều hướng đến trang phim theo thể loại
  const handleTypeClick = () =>
    navigate(movieType === "series" ? "/phim-bo" : "/phim-le"); //Điều hướng đến trang phim lẻ hoặc bộ

  const toggleFavoriteHandler = async () => {
    //Gửi Nút yêu thich phim
    console.log("isLoggedIn:", isLoggedIn); // Kiểm tra giá trị isLoggedIn
    if (isLoggedIn) {
      if (movie) {
        try {
          await toggleFavorite(movie._id);
          setIsFavorite((prevState) => !prevState);
        } catch (error) {
          console.error("Failed to toggle favorite:", error);
        }
      }
    } else {
      setNotification("Bạn phải đăng nhập để thực hiện thao tác này !!");
      console.log("Notification set");
      setTimeout(() => setNotification(""), 3000); // Xóa thông báo sau 3 giây
    }
  };
  const checkFavoriteStatus = async () => {
    //Kiểm tra trạng thái yêu thích
    if (movie) {
      try {
        const response = await axios.get(
          `${config.API_URL}/movies/favorite/${movie._id}`,
          { withCredentials: true }
        );
        setIsFavorite(response.data.isFavorite);
      } catch (error) {
        console.error("Failed to check favorite status:", error);
      }
    }
  };

  if (loading) return <Spinner />;
  if (error) return <div>Error: {error}</div>;
  if (!movie) return <div>No movie data available</div>;

  const serverData = movie.episodes && movie.episodes[currentServer];
  const episodeData = serverData && serverData.server_data[currentEpisode];

  return (
    //Giao diện xem phim
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white min-h-screen">
      <NavBar />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            {/* Breadcrumbs */}
            <div className="text-sm mb-4 flex flex-wrap items-center space-x-2">
              <a
                onClick={handleHomeClick}
                className="text-blue-400 hover:text-blue-300 transition duration-300 ease-in-out cursor-pointer"
              >
                Trang Chủ
              </a>
              <span className="text-gray-500">&gt;</span>
              <a
                onClick={handleTypeClick}
                className="text-blue-400 hover:text-blue-300 transition duration-300 ease-in-out cursor-pointer"
              >
                {movieType === "series" ? "Phim Bộ" : "Phim Lẻ"}
              </a>
              <span className="text-gray-500">&gt;</span>
              <a
                onClick={handleCountryClick}
                className="text-blue-400 hover:text-blue-300 transition duration-300 ease-in-out cursor-pointer"
              >
                {country.name || "Unknown Country"}
              </a>
              <span className="text-gray-500">&gt;</span>
              <a
                onClick={handleCategoryClick}
                className="text-blue-400 hover:text-blue-300 transition duration-300 ease-in-out cursor-pointer"
              >
                {category.name || "Unknown Category"}
              </a>
              <span className="text-gray-500">&gt;</span>
              <span className="text-white font-semibold">{movie.name}</span>
            </div>

            {/* Video Player */}
            <div className="video-player mb-6 rounded-lg overflow-hidden shadow-lg">
              {episodeData && (
                <iframe
                  key={`${currentServer}-${currentEpisode}`}
                  src={episodeData.link_embed}
                  width="100%"
                  height="700px"
                  allowFullScreen
                ></iframe>
              )}
            </div>

            {/* Notification */}
            {notification && (
              <div className="bg-red-600 text-white p-3 rounded-lg mb-4 animate-pulse">
                {notification}
              </div>
            )}
            <div>
              {/* Favorite Button */}
              <button
                onClick={toggleFavoriteHandler}
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
            {/* Thêm nút báo lỗi gần phần player video */}
            <div className="mt-4">
              <button
                onClick={() => setShowReportModal(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full transition duration-300"
              >
                Báo lỗi tập phim
              </button>
            </div>

            {/* Modal báo lỗi */}
            {showReportModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-gray-800 p-6 rounded-lg w-96">
                  <h3 className="text-xl font-semibold mb-4">
                    Báo lỗi tập phim
                  </h3>
                  <textarea
                    className="w-full p-2 mb-4 bg-gray-700 rounded"
                    rows="4"
                    placeholder="Mô tả lỗi..."
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                  ></textarea>
                  <div className="flex justify-end">
                    <button
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded mr-2"
                      onClick={() => setShowReportModal(false)}
                    >
                      Hủy
                    </button>
                    <button
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                      onClick={handleReportIssue}
                    >
                      Gửi báo cáo
                    </button>
                  </div>
                </div>
              </div>
            )}
            {/* Server and Episode Selection */}
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4 text-cyan-400">
                Chọn server
              </h3>
              <div className="flex flex-wrap gap-2 mb-6">
                {movie.episodes.map((server, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentServer(index)}
                    className={`px-4 py-2 rounded-full transition duration-300 ease-in-out ${
                      currentServer === index
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-gray-700 hover:bg-gray-600"
                    }`}
                  >
                    {server.server_name}
                  </button>
                ))}
              </div>

              <h3 className="text-xl font-semibold mb-4 text-cyan-400">
                Chọn tập phim
              </h3>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                {serverData?.server_data.map((episode, index) => (
                  <button
                    key={index}
                    onClick={() => handleEpisodeSelect(index, episode.slug)}
                    className={`px-3 py-2 rounded-lg transition duration-300 ease-in-out ${
                      currentEpisode === index
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-gray-700 hover:bg-gray-600"
                    }`}
                  >
                    Tập {episode.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Movie Content */}
            <div className="mt-8 bg-gray-800 rounded-lg p-6 shadow-lg">
              <h2 className="text-2xl font-bold mb-4 text-cyan-400">
                Nội dung phim
              </h2>
              <div className="prose prose-invert">
                {movie.content ? (
                  <div dangerouslySetInnerHTML={{ __html: movie.content }} />
                ) : (
                  <div>Đang Cập Nhật. . . </div>
                )}
              </div>
            </div>

            {/* Comments */}
            <div className="mt-8 bg-gray-800 rounded-lg p-6 shadow-lg">
              {/* Notification */}
              {notification && (
                <div className="bg-red-600 text-white p-3 rounded-lg mb-4 animate-pulse">
                  {notification}
                </div>
              )}
              <h2 className="text-2xl font-bold mb-6 text-cyan-400">
                Bình luận
              </h2>
              <div className="mb-4">
                <textarea
                  className="w-full p-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out"
                  rows="3"
                  placeholder="Viết bình luận của bạn..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                ></textarea>
                <button
                  className="mt-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-full transition duration-300 ease-in-out"
                  onClick={handleAddComment}
                >
                  Gửi bình luận
                </button>
              </div>

              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment._id} className="bg-gray-700 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-semibold text-cyan-400">
                        {comment.user && comment.user.username
                          ? comment.user.username
                          : "Unknown User"}
                      </p>
                      <div className="flex space-x-2">
                        {currentUser &&
                        comment.user &&
                        comment.user._id === currentUser._id ? (
                          <>
                            <button
                              onClick={() => {
                                setEditingCommentId(comment._id);
                                setEditCommentText(comment.comment);
                              }}
                              className="flex items-center px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300 ease-in-out"
                            >
                              <FaEdit className="mr-1" />
                              Sửa
                            </button>
                            <button
                              onClick={() => handleDeleteComment(comment._id)}
                              className="flex items-center px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition duration-300 ease-in-out"
                            >
                              <FaTrash className="mr-1" />
                              Xóa
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => {
                              setCommentToReport(comment);
                              setShowReportCommentModal(true);
                            }}
                            className="flex items-center px-2 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600 transition duration-300 ease-in-out"
                          >
                            <FaFlag className="mr-1" />
                            Báo cáo
                          </button>
                        )}
                      </div>
                    </div>
                    {editingCommentId === comment._id ? (
                      <div>
                        <textarea
                          className="w-full p-2 mt-2 bg-gray-600 rounded"
                          value={editCommentText}
                          onChange={(e) => setEditCommentText(e.target.value)}
                        />
                        <button
                          onClick={() => handleEditComment(comment._id)}
                          className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
                        >
                          Lưu
                        </button>
                        <button
                          onClick={() => setEditingCommentId(null)}
                          className="mt-2 ml-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded"
                        >
                          Hủy
                        </button>
                      </div>
                    ) : (
                      <p className="mt-2">{comment.comment}</p>
                    )}
                    <p className="text-sm text-gray-400 mt-2">
                      {new Date(comment.created).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {showReportCommentModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-gray-800 p-6 rounded-lg w-96">
                <h3 className="text-xl font-semibold mb-4">
                  Báo cáo bình luận
                </h3>
                <textarea
                  className="w-full p-2 mb-4 bg-gray-700 rounded"
                  rows="4"
                  placeholder="Lý do báo cáo..."
                  value={reportCommentReason}
                  onChange={(e) => setReportCommentReason(e.target.value)}
                ></textarea>
                <div className="flex justify-end">
                  <button
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded mr-2"
                    onClick={() => setShowReportCommentModal(false)}
                  >
                    Hủy
                  </button>
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                    onClick={handleReportComment}
                  >
                    Gửi báo cáo
                  </button>
                </div>
              </div>
            </div>
          )}
          {showReportCommentModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-gray-800 p-6 rounded-lg w-96">
                <h3 className="text-xl font-semibold mb-4">
                  Báo cáo bình luận
                </h3>
                <textarea
                  className="w-full p-2 mb-4 bg-gray-700 rounded"
                  rows="4"
                  placeholder="Lý do báo cáo..."
                  value={reportCommentReason}
                  onChange={(e) => setReportCommentReason(e.target.value)}
                ></textarea>
                <div className="flex justify-end">
                  <button
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded mr-2"
                    onClick={() => setShowReportCommentModal(false)}
                  >
                    Hủy
                  </button>
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                    onClick={handleReportComment}
                  >
                    Gửi báo cáo
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Suggested Movies */}
          <div className="lg:col-span-1">
            <h3 className="text-2xl font-semibold mb-6 text-cyan-400">
              Phim đề xuất
            </h3>
            <div className="space-y-6">
              {suggestedMovies.length > 0 ? (
                suggestedMovies.map((movie) => (
                  <Link
                    key={movie._id}
                    to={`/detail/${movie.slug}`}
                    className="block group"
                  >
                    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transition duration-300 ease-in-out transform group-hover:scale-105">
                      <img
                        src={movie.thumb_url}
                        alt={movie.name}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <h4 className="font-semibold truncate group-hover:text-cyan-400 transition duration-300 ease-in-out">
                          {movie.name}
                        </h4>
                        <div className="flex justify-between text-sm text-gray-400 mt-2">
                          <span>{movie.year}</span>
                          <StarRating rating={movie.averageRating || 0} />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <p>Không có phim đề xuất</p>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <ScrollToTopButton />
    </div>
  );
};

export default WatchMovie;
