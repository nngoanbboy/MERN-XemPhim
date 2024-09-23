import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import config from "../../config";
import NavBar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Spinner from "../../components/Spinner";
import ScrollToTopButton from "../../components/ScrollToTopButton.jsx";
import {
  FaChevronLeft,
  FaChevronRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
} from "react-icons/fa";
//Giao Diện Tìm Phim Theo Thể Loại
const MovieByGenre = () => {
  const { slug } = useParams();
  const [movies, setMovies] = useState([]);
  const [genreName, setGenreName] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const moviesPerPage = 30;
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [years, setYears] = useState([]);
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    //Lấy Dữ liệu Từ Backend
    const fetchData = async () => {
      try {
        setLoading(true);
        const [moviesRes, countriesRes] = await Promise.all([
          axios.get(`${config.API_URL}/movies/category/${slug}`),
          axios.get(`${config.API_URL}/countries`),
        ]);

        setMovies(moviesRes.data.movies);
        setCountries(countriesRes.data.countries || []);

        // Create list of years
        const currentYear = new Date().getFullYear();
        setYears(Array.from({ length: 50 }, (_, i) => currentYear - i));

        const response = await axios.get(
          `${config.API_URL}/genres/slug/${slug}`
        );
        setGenreName(response.data.genre.name);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  const filterMovies = () => {
    //Lọc Phim
    return movies.filter((movie) => {
      const typeMatch = selectedType ? movie.type === selectedType : true;
      const yearMatch = selectedYear
        ? movie.year.toString() === selectedYear
        : true;
      const countryMatch = selectedCountry
        ? movie.country.some((c) => c.slug === selectedCountry)
        : true;

      return typeMatch && yearMatch && countryMatch;
    });
  };

  if (loading) {
    return <Spinner />;
  }

  const handleMovieClick = (movie) => {
    navigate(`/detail/${movie.slug}`);
  };
  //Phân Trang
  const filteredMovies = filterMovies();
  const totalPages = Math.ceil(filteredMovies.length / moviesPerPage);
  const indexOfLastMovie = currentPage * moviesPerPage;
  const indexOfFirstMovie = indexOfLastMovie - moviesPerPage;
  const currentMovies = filteredMovies.slice(
    indexOfFirstMovie,
    indexOfLastMovie
  );

  const getPageNumbers = () => {
    let numbers = [];
    if (totalPages <= 5) {
      numbers = [...Array(totalPages)].map((_, i) => i + 1);
    } else {
      if (currentPage <= 3) {
        numbers = [1, 2, 3, 4, "...", totalPages];
      } else if (currentPage >= totalPages - 2) {
        numbers = [
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        ];
      } else {
        numbers = [
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages,
        ];
      }
    }
    return numbers;
  };

  const changePage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    //JSX Giao Diện
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <NavBar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
          Phim {genreName}
        </h1>
        <div className="mb-8 flex flex-wrap justify-center gap-4">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="p-2 border rounded bg-gray-700 text-white"
          >
            <option value="">Tất cả loại</option>
            <option value="series">Phim Bộ</option>
            <option value="single">Phim Lẻ</option>
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="p-2 border rounded bg-gray-700 text-white"
          >
            <option value="">Tất cả năm</option>
            {years.map((year) => (
              <option key={year} value={year.toString()}>
                {year}
              </option>
            ))}
          </select>

          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="p-2 border rounded bg-gray-700 text-white"
          >
            <option value="">Tất cả quốc gia</option>
            {countries.map((country) => (
              <option key={country.id} value={country.slug}>
                {country.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {currentMovies.map((movie) => (
            <div
              key={movie._id}
              className="relative group cursor-pointer transform transition duration-300 hover:scale-105"
              onClick={() => handleMovieClick(movie)}
            >
              <div className="relative overflow-hidden rounded-lg shadow-lg">
                <img
                  src={movie.thumb_url}
                  alt={movie.name}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <h3 className="text-lg font-semibold leading-tight mb-2">
                    {movie.name}
                  </h3>
                  {movie.year && (
                    <span className="inline-block bg-red-600 text-white text-xs px-2 py-1 rounded">
                      {movie.year}
                    </span>
                  )}
                </div>
              </div>
              <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                HD VIETSUB
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-10">
          <nav
            className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
            aria-label="Pagination"
          >
            <button
              onClick={() => changePage(1)}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              disabled={currentPage === 1}
            >
              <span className="sr-only">First</span>
              <FaAngleDoubleLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              onClick={() => changePage(currentPage - 1)}
              className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              disabled={currentPage === 1}
            >
              <span className="sr-only">Previous</span>
              <FaChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            {getPageNumbers().map((number, index) => (
              <button
                key={index}
                onClick={() =>
                  typeof number === "number" ? changePage(number) : null
                }
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium
                  ${
                    currentPage === number
                      ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
                      : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                  }
                  ${number === "..." ? "cursor-default" : "cursor-pointer"}
                `}
              >
                {number}
              </button>
            ))}
            <button
              onClick={() => changePage(currentPage + 1)}
              className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              disabled={currentPage === totalPages}
            >
              <span className="sr-only">Next</span>
              <FaChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              onClick={() => changePage(totalPages)}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              disabled={currentPage === totalPages}
            >
              <span className="sr-only">Last</span>
              <FaAngleDoubleRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>
      <Footer />
      <ScrollToTopButton />
    </div>
  );
};

export default MovieByGenre;
