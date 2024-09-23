import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import config from "../../config";
import NavBar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Spinner from "../../components/Spinner";

const MovieHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${config.API_URL}/movies/history`, {
          withCredentials: true,
        });
        // Lọc ra các mục lịch sử có phim hợp lệ
        const validHistory = response.data.history.filter(
          (item) => item.movie && item.movie.slug
        );
        setHistory(validHistory);
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const deleteHistoryItem = async (historyId) => {
    try {
      await axios.delete(`${config.API_URL}/movies/history/${historyId}`, {
        withCredentials: true,
      });
      setHistory((prevHistory) =>
        prevHistory.filter((item) => item._id !== historyId)
      );
      setItemToDelete(null);
    } catch (error) {
      console.error("Failed to delete history item:", error);
      // Có thể thêm thông báo lỗi cho người dùng ở đây
    }
  };

  const clearAllHistory = async () => {
    try {
      const response = await axios.delete(
        `${config.API_URL}/movies/history/all`,
        { withCredentials: true }
      );
      if (response.data.status) {
        setHistory([]);
      } else {
        console.error("Failed to clear history:", response.data.message);
        // Thêm thông báo lỗi cho người dùng
      }
    } catch (error) {
      console.error(
        "Failed to clear history:",
        error.response ? error.response.data : error.message
      );
      // Thêm thông báo lỗi cho người dùng
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="flex flex-col bg-gray-900 text-white min-h-screen">
      <NavBar />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Lịch sử xem phim</h1>
          {history.length > 0 && (
            <button
              onClick={clearAllHistory}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition duration-300"
            >
              Xóa tất cả
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {history.map((item) =>
            item && item.movie && item.movie.slug ? (
              <div
                key={item._id}
                className="bg-gray-800 rounded-lg overflow-hidden relative"
              >
                <Link to={`/detail/${item.movie.slug}`}>
                  <img
                    src={item.movie.thumb_url}
                    alt={item.movie.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-2">
                    <div className="flex justify-between items-center">
                      <h2 className="font-semibold truncate flex-grow">
                        {item.movie.name}
                      </h2>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setItemToDelete(item);
                        }}
                        className="bg-red-600 text-white px-4 py-4 text-xs-l rounded hover:bg-red-700 transition duration-300 ml-2"
                      >
                        Xóa
                      </button>
                    </div>
                    <p className="text-sm text-gray-400">{item.movie.year}</p>
                    <p className="text-xs text-gray-500">
                      Xem lần cuối: {new Date(item.watchedAt).toLocaleString()}
                    </p>
                  </div>
                </Link>
              </div>
            ) : null
          )}
        </div>
        {history.length === 0 && (
          <p className="text-center text-gray-500 mt-8">
            Bạn chưa xem phim nào.
          </p>
        )}
      </div>
      <Footer />
      <ConfirmModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={() => deleteHistoryItem(itemToDelete._id)}
        movieName={itemToDelete?.movie?.name}
      />
    </div>
  );
};

const ConfirmModal = ({ isOpen, onClose, onConfirm, movieName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl mb-4">Xác nhận xóa</h2>
        <p>Bạn có chắc chắn muốn xóa "{movieName}" khỏi lịch sử xem không?</p>
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
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
};

export default MovieHistory;
