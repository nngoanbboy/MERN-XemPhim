import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import config from "../../config";
import NavBar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { FavoriteContext } from "../Auth/FavoriteContext";
import Spinner from "../../components/Spinner";

const FavoriteMovie = () => {
  const { favorites, setFavorites, toggleFavorite } =
    useContext(FavoriteContext);
  const [loading, setLoading] = useState(true);
  const [movieToRemove, setMovieToRemove] = useState(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${config.API_URL}/movies/favorites`, {
          withCredentials: true,
        });

        // Lọc ra các phim có đầy đủ thông tin
        const validFavorites = response.data.favorites.filter(
          (movie) => movie && movie.slug
        );
        setFavorites(validFavorites);
      } catch (error) {
        console.error("Failed to fetch favorites:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [setFavorites]);

  const confirmRemoveFavorite = async () => {
    if (movieToRemove) {
      try {
        await toggleFavorite(movieToRemove._id);
        // Cập nhật lại danh sách yêu thích sau khi xóa thành công
        setFavorites((prevFavorites) =>
          prevFavorites.filter((movie) => movie._id !== movieToRemove._id)
        );
      } catch (error) {
        console.error("Error removing favorite:", error);
        // Hiển thị thông báo lỗi cho người dùng nếu cần
      }
      setMovieToRemove(null);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <NavBar />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-2xl font-bold mb-4">Phim yêu thích</h1>
        {favorites.length === 0 ? (
          <p className="text-center text-gray-400">
            Bạn chưa thích bộ phim nào
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {favorites.map((movie) =>
              movie && movie.slug ? (
                <div
                  key={movie._id}
                  className="bg-gray-800 rounded-lg overflow-hidden"
                >
                  <Link to={`/detail/${movie.slug}`}>
                    <img
                      src={movie.thumb_url}
                      alt={movie.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-2">
                      <h2 className="font-semibold truncate">{movie.name}</h2>
                      <p className="text-sm text-gray-400">{movie.year}</p>
                    </div>
                  </Link>
                  <button
                    onClick={() => setMovieToRemove(movie)}
                    className="w-full bg-red-600 text-white py-2 mt-2 hover:bg-red-700 transition duration-300"
                  >
                    Bỏ Yêu thích
                  </button>
                </div>
              ) : null
            )}
          </div>
        )}
      </div>
      <Footer />
      <ConfirmModal
        isOpen={!!movieToRemove}
        onClose={() => setMovieToRemove(null)}
        onConfirm={confirmRemoveFavorite}
        movieName={movieToRemove?.name}
      />
    </div>
  );
};

const ConfirmModal = ({ isOpen, onClose, onConfirm, movieName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl mb-4">Xác nhận bỏ yêu thích</h2>
        <p>
          Bạn có chắc chắn muốn bỏ "{movieName}" khỏi danh sách yêu thích không?
        </p>
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-600 text-white px-4 py-2 rounded mr-2 hover:bg-gray-700 transition duration-300"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition duration-300"
          >
            Bỏ yêu thích
          </button>
        </div>
      </div>
    </div>
  );
};

export default FavoriteMovie;
