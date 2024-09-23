import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../../config';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const GenreManagement = () => {
  const [genres, setGenres] = useState([]);
  const [displayedGenres, setDisplayedGenres] = useState([]);
  const [newGenre, setNewGenre] = useState('');
  const [editingGenreId, setEditingGenreId] = useState(null);
  const [editingGenreName, setEditingGenreName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchGenres();
  }, []);

  useEffect(() => {
    handleSearchAndPagination();
  }, [searchTerm, page, genres]);

  const fetchGenres = async () => {
    try {
      const response = await axios.get(`${config.API_URL}/genres`);
      if (Array.isArray(response.data)) {
        setGenres(response.data);
      } else if (response.data.genres && Array.isArray(response.data.genres)) {
        setGenres(response.data.genres);
      } else {
        console.error('Unexpected API response format:', response.data);
        setGenres([]);
      }
    } catch (err) {
      console.error('Failed to fetch genres', err);
      setGenres([]);
    }
  };

  const handleSearchAndPagination = () => {
    let filteredGenres = genres;
    if (searchTerm) {
      filteredGenres = genres.filter((genre) =>
        genre.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setDisplayedGenres(filteredGenres.slice(startIndex, endIndex));
  };

  const addGenre = async () => {
    try {
      await axios.post(`${config.API_URL}/genres`, { name: newGenre });
      setNewGenre('');
      fetchGenres();
      toast.success('Thêm thể loại thành công!');
    } catch (err) {
      console.error('Failed to add genre', err);
      toast.error('Thêm thể loại thất bại.');
    }
  };

  const updateGenre = async (id) => {
    try {
      await axios.put(`${config.API_URL}/genres/${id}`, { name: editingGenreName });
      setEditingGenreId(null);
      setEditingGenreName('');
      fetchGenres();
      toast.success('Cập nhật thể loại thành công!');
    } catch (err) {
      console.error('Failed to update genre', err);
      toast.error('Cập nhật thể loại thất bại.');
    }
  };

  const deleteGenre = async (id) => {
    try {
      await axios.delete(`${config.API_URL}/genres/${id}`);
      fetchGenres();
      toast.success('Xóa thể loại thành công!');
    } catch (err) {
      console.error('Failed to delete genre', err)
      toast.error('Xóa thể loại thất bại.');
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to the first page on search
  };

  const totalPages = Math.ceil(genres.length / itemsPerPage);

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-3xl font-bold mb-6 text-center">Quản lý thể loại</h2>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
      {/* Thêm thể loại mới */}
      <div className="mb-6 flex items-center">
        <input
          type="text"
          value={newGenre}
          onChange={(e) => setNewGenre(e.target.value)}
          className="border border-gray-300 p-2 mr-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Tên thể loại mới"
        />
        <button
          onClick={addGenre}
          className="bg-blue-500 text-white p-2 rounded-lg shadow-sm hover:bg-blue-600 transition duration-300"
        >
          Thêm thể loại
        </button>
      </div>

      {/* Tìm kiếm thể loại */}
      <div className="mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          className="border border-gray-300 p-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          placeholder="Tìm kiếm thể loại"
        />
      </div>
      </div>
      {/* Danh sách thể loại */}
      <ul className="bg-white shadow-md rounded-lg p-4">
        {displayedGenres.map((genre) => (
          <li key={genre._id} className="flex justify-between items-center py-2 px-4 bg-gray-100 rounded-lg mb-2 shadow-md">
            {editingGenreId === genre._id ? (
              <div className="flex items-center w-full">
                <input
                  type="text"
                  value={editingGenreName}
                  onChange={(e) => setEditingGenreName(e.target.value)}
                  className="border p-2 rounded-l-md mr-2 w-full"
                />
                <button
                  onClick={() => updateGenre(genre._id)}
                  className="bg-green-500 text-white p-2 rounded-r-md mr-2"
                >
                  Lưu
                </button>
                <button
                  onClick={() => {
                    setEditingGenreId(null);
                    setEditingGenreName('');
                  }}
                  className="bg-gray-500 text-white p-2 rounded-md"
                >
                  Hủy
                </button>
              </div>
            ) : (
              <div className="flex justify-between items-center w-full">
                <span className="text-lg font-medium">{genre.name}</span>
                <div className="flex items-center">
                  <button
                    onClick={() => {
                      setEditingGenreId(genre._id);
                      setEditingGenreName(genre.name);
                    }}
                    className="bg-yellow-500 text-white p-2 rounded-md mr-2"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => deleteGenre(genre._id)}
                    className="bg-red-500 text-white p-2 rounded-md"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          className="bg-gray-500 text-white p-2 rounded-lg shadow-sm hover:bg-gray-600 transition duration-300"
          disabled={page === 1}
        >
          Trang trước
        </button>
        <span className="text-gray-800">
          Trang {page} / {totalPages}
        </span>
        <button
          onClick={() => setPage((prev) => (prev < totalPages ? prev + 1 : prev))}
          className="bg-gray-500 text-white p-2 rounded-lg shadow-sm hover:bg-gray-600 transition duration-300"
          disabled={page === totalPages}
        >
          Trang sau
        </button>
      </div>
      <ToastContainer />
    </div>
  );
};

export default GenreManagement;
