import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import config from "../../config";
import { Link } from "react-router-dom";
import ScrollToTopButton from "../../components/ScrollToTopButton.jsx";
import { FaSearch, FaUser, FaVideo, FaFilm } from "react-icons/fa";

const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [genres, setGenres] = useState([]);
  const [countries, setCountries] = useState([]);
  const [years, setYears] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actor, setActor] = useState("");
  const [director, setDirector] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [genresRes, countriesRes] = await Promise.all([
          axios.get(`${config.API_URL}/genres`),
          axios.get(`${config.API_URL}/countries`),
        ]);

        if (genresRes.data && Array.isArray(genresRes.data)) {
          setGenres(genresRes.data);
        } else if (genresRes.data && Array.isArray(genresRes.data.genres)) {
          setGenres(genresRes.data.genres);
        } else {
          setGenres([]);
        }

        if (countriesRes.data && Array.isArray(countriesRes.data)) {
          setCountries(countriesRes.data);
        } else if (
          countriesRes.data &&
          Array.isArray(countriesRes.data.countries)
        ) {
          setCountries(countriesRes.data.countries);
        } else {
          setCountries([]);
        }

        const currentYear = new Date().getFullYear();
        setYears(Array.from({ length: 50 }, (_, i) => currentYear - i));
      } catch (error) {
        setGenres([]);
        setCountries([]);
      }
    };
    fetchData();
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    try {
      let url = `${config.API_URL}/movies/search?`;
      if (searchTerm) url += `term=${encodeURIComponent(searchTerm)}&`;
      if (selectedGenre) url += `genre=${selectedGenre}&`;
      if (selectedCountry) url += `country=${selectedCountry}&`;
      if (selectedYear) url += `year=${selectedYear}&`;
      if (selectedType) url += `type=${selectedType}&`;
      if (actor) url += `actor=${encodeURIComponent(actor)}&`;
      if (director) url += `director=${encodeURIComponent(director)}&`;

      const res = await axios.get(url);
      setSearchResults(res.data.movies || []);
      console.log(res.data.movies);
    } catch (error) {
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMovieClick = (slug) => {
    navigate(`/detail/${slug}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-extrabold text-center mb-10 text-indigo-900">
          Tìm Kiếm Phim
        </h1>
        <Link
          to="/"
          className="block text-center text-indigo-600 hover:text-indigo-800 mb-8 text-lg font-semibold transition bg-purple-300 p-2 rounded-lg"
        >
          Quay lại Trang Chủ
        </Link>

        <div className="bg-white rounded-xl shadow-2xl p-8 mb-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="flex items-center bg-gray-100 rounded-lg p-3">
              <FaSearch className="text-gray-500 mr-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm phim..."
                className="bg-transparent w-full focus:outline-none"
              />
            </div>
            <div className="flex items-center bg-gray-100 rounded-lg p-3">
              <FaUser className="text-gray-500 mr-3" />
              <input
                type="text"
                value={actor}
                onChange={(e) => setActor(e.target.value)}
                placeholder="Diễn viên"
                className="bg-transparent w-full focus:outline-none"
              />
            </div>
            <div className="flex items-center bg-gray-100 rounded-lg p-3">
              <FaVideo className="text-gray-500 mr-3" />
              <input
                type="text"
                value={director}
                onChange={(e) => setDirector(e.target.value)}
                placeholder="Đạo diễn"
                className="bg-transparent w-full focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="bg-gray-100 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Thể loại</option>
              {genres.map((genre) => (
                <option key={genre._id} value={genre.slug || genre._id}>
                  {genre.name}
                </option>
              ))}
            </select>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="bg-gray-100 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Quốc gia</option>
              {countries.map((country) => (
                <option key={country._id} value={country.slug || country._id}>
                  {country.name}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-gray-100 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Năm sản xuất</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-gray-100 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Loại phim</option>
              <option value="single">Phim lẻ</option>
              <option value="series">Phim bộ</option>
            </select>
          </div>

          <button
            onClick={handleSearch}
            className="bg-indigo-600 text-white p-4 rounded-lg w-full hover:bg-indigo-700 transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Đang tìm kiếm...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <FaSearch className="mr-2" />
                Tìm kiếm
              </span>
            )}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {searchResults.map((movie) => (
            <div
              key={movie._id}
              className="bg-white rounded-xl overflow-hidden shadow-lg cursor-pointer hover:shadow-2xl transition transform hover:scale-105"
              onClick={() => handleMovieClick(movie.slug)}
            >
              <div className="relative pb-2/3">
                <img
                  src={movie.thumb_url || movie.poster_url}
                  alt={movie.name || movie.title}
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-800 truncate">
                  {movie.name || movie.title}
                </h3>
                <p className="text-indigo-600 font-semibold">{movie.year}</p>
              </div>
            </div>
          ))}
        </div>

        {searchResults.length === 0 && !loading && (
          <p className="text-center text-gray-700 mt-8 text-xl">
            Không tìm thấy kết quả nào. Hãy thử tìm kiếm khác!
          </p>
        )}
      </div>
      <ScrollToTopButton />
    </div>
  );
};

export default SearchPage;
