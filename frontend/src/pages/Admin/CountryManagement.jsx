import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../../config';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CountryManagement = () => {
  const [countries, setCountries] = useState([]);
  const [displayedCountries, setDisplayedCountries] = useState([]);
  const [newCountry, setNewCountry] = useState('');
  const [editingCountryId, setEditingCountryId] = useState(null);
  const [editingCountryName, setEditingCountryName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    handleSearchAndPagination();
  }, [searchTerm, page, countries]);

  const fetchCountries = async () => {
    try {
      const response = await axios.get(`${config.API_URL}/countries`);
      if (Array.isArray(response.data)) {
        setCountries(response.data);
      } else if (response.data.countries && Array.isArray(response.data.countries)) {
        setCountries(response.data.countries);
      } else {
        console.error('Unexpected API response format:', response.data);
        setCountries([]);
      }
    } catch (error) {
      console.error('Failed to fetch countries', error);
      setCountries([]);
    }
  };

  const handleSearchAndPagination = () => {
    let filteredCountries = countries;
    if (searchTerm) {
      filteredCountries = countries.filter((country) =>
        country.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setDisplayedCountries(filteredCountries.slice(startIndex, endIndex));
  };

  const addCountry = async () => {
    try {
      await axios.post(`${config.API_URL}/countries`, { name: newCountry });
      setNewCountry('');
      fetchCountries();
      toast.success('Thêm Quốc Gia thành công!');
    } catch (err) {
      console.error('Failed to add country', err);
      toast.error('Thêm Quốc Gia thất bại.');
    }
  };

  const updateCountry = async (id) => {
    try {
      await axios.put(`${config.API_URL}/countries/${id}`, { name: editingCountryName });
      setEditingCountryId(null);
      setEditingCountryName('');
      toast.success('Cập nhật Quốc Gia thành công!');
      fetchCountries();
    } catch (err) {
      console.error('Failed to update country', err);
      toast.error('Cập nhật Quốc Gia thất bại.');
    }
  };

  const deleteCountry = async (id) => {
    try {
      await axios.delete(`${config.API_URL}/countries/${id}`);
      toast.success('Xóa Quốc Gia thành công!');
      fetchCountries();
    } catch (err) {
      console.error('Failed to delete country', err);
      toast.error('Xóa Quốc Gia thất bại.');
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to the first page on search
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6 text-center">Quản lý quốc gia</h2>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div className="flex items-center mb-4 md:mb-0">
          <input
            type="text"
            value={newCountry}
            onChange={(e) => setNewCountry(e.target.value)}
            className="border p-2 rounded-l-md mr-2 w-full md:w-auto"
            placeholder="Tên quốc gia mới"
          />
          <button onClick={addCountry} className="bg-blue-500 text-white p-2 rounded-r-md">
            Thêm quốc gia
          </button>
        </div>
        <div className="flex items-center">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            className="border p-2 rounded-md w-full md:w-auto"
            placeholder="Tìm kiếm quốc gia"
          />
        </div>
      </div>
      <ul className="bg-white shadow-md rounded-lg p-4">
        {displayedCountries.map((country) => (
          <li
            key={country._id}
            className="flex justify-between items-center py-2 px-4 bg-gray-100 rounded-lg mb-2 shadow-md"
          >
            {editingCountryId === country._id ? (
              <div className="flex items-center w-full">
                <input
                  type="text"
                  value={editingCountryName}
                  onChange={(e) => setEditingCountryName(e.target.value)}
                  className="border p-2 rounded-l-md mr-2 w-full"
                />
                <button
                  onClick={() => updateCountry(country._id)}
                  className="bg-green-500 text-white p-2 rounded-r-md mr-2"
                >
                  Lưu
                </button>
                <button
                  onClick={() => {
                    setEditingCountryId(null);
                    setEditingCountryName('');
                  }}
                  className="bg-gray-500 text-white p-2 rounded-md"
                >
                  Hủy
                </button>
              </div>
            ) : (
              <>
                <span className="text-lg font-medium">{country.name}</span>
                <div className="flex items-center">
                  <button
                    onClick={() => {
                      setEditingCountryId(country._id);
                      setEditingCountryName(country.name);
                    }}
                    className="bg-yellow-500 text-white p-2 rounded-md mr-2"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => deleteCountry(country._id)}
                    className="bg-red-500 text-white p-2 rounded-md"
                  >
                    Xóa
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          className="bg-gray-500 text-white p-2 rounded-md"
          disabled={page === 1}
        >
          Trang trước
        </button>
        <span>
          Trang {page} / {Math.ceil(countries.length / itemsPerPage)}
        </span>
        <button
          onClick={() => setPage((prev) => (prev < Math.ceil(countries.length / itemsPerPage) ? prev + 1 : prev))}
          className="bg-gray-500 text-white p-2 rounded-md"
          disabled={page === Math.ceil(countries.length / itemsPerPage)}
        >
          Trang sau
        </button>
      </div>

      <ToastContainer />
    </div>
  );
};

export default CountryManagement;
