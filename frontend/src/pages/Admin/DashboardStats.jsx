// src/components/admin/DashboardStats.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import config from "../../config";
import { Pie } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";

Chart.register(ArcElement, Tooltip, Legend);

const DashboardStats = () => {
  const [stats, setStats] = useState({
    moviesByCategory: [],
    moviesByYear: [],
    topViewedMovies: [],
    topRatedMovies: [],
  });
  const [viewType, setViewType] = useState({
    category: "chart",
    year: "chart",
    topViewed: "chart",
    topRated: "chart",
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(
          `${config.API_URL}/movies/admin/stats`
        );
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  const renderMoviesByCategory = () => {
    if (viewType.category === "list") {
      return (
        <ul>
          {stats.moviesByCategory.map((category) => (
            <li
              key={category._id}
              className="flex justify-between py-2 border-b border-gray-200"
            >
              <span>{category._id}</span>
              <span className="font-semibold">{category.count}</span>
            </li>
          ))}
        </ul>
      );
    } else {
      const data = {
        labels: stats.moviesByCategory.map((category) => category._id),
        datasets: [
          {
            data: stats.moviesByCategory.map((category) => category.count),
            backgroundColor: [
              "#FF6384",
              "#36A2EB",
              "#FFCE56",
              "#4BC0C0",
              "#9966FF",
              "#FF9F40",
              "#F7464A",
              "#46BFBD",
              "#FDB45C",
              "#949FB1",
              "#4D5360",
              "#AC64AD",
              "#33FF57",
              "#FF5733",
              "#33FFF5",
              "#8A33FF",
              "#FF33A8",
              "#FFC300",
              "#DAF7A6",
              "#581845",
              "#C70039",
            ],
          },
        ],
      };
      return <Pie data={data} />;
    }
  };

  const renderMoviesByYear = () => {
    if (viewType.year === "list") {
      return (
        <ul>
          {stats.moviesByYear.map((year) => (
            <li
              key={year._id}
              className="flex justify-between py-2 border-b border-gray-200"
            >
              <span>{year._id}</span>
              <span className="font-semibold">{year.count}</span>
            </li>
          ))}
        </ul>
      );
    } else {
      const data = {
        labels: stats.moviesByYear.map((year) => year._id),
        datasets: [
          {
            data: stats.moviesByYear.map((year) => year.count),
            backgroundColor: [
              "#FF6384",
              "#36A2EB",
              "#FFCE56",
              "#4BC0C0",
              "#9966FF",
              "#FF9F40",
              "#F7464A",
              "#46BFBD",
              "#FDB45C",
              "#949FB1",
              "#4D5360",
              "#AC64AD",
              "#33FF57",
              "#FF5733",
              "#33FFF5",
              "#8A33FF",
              "#FF33A8",
              "#FFC300",
              "#DAF7A6",
              "#581845",
              "#C70039",
              "#FF4500",
              "#8B4513",
              "#2E8B57",
              "#BDB76B",
              "#FFD700",
              "#6B8E23",
              "#FF69B4",
              "#8A2BE2",
              "#5F9EA0",
              "#D2691E",
              "#FF7F50",
              "#6495ED",
              "#DC143C",
              "#00FFFF",
              "#00008B",
              "#008B8B",
              "#B8860B",
              "#A9A9A9",
              "#006400",
              "#BDB76B",
              "#8B008B",
              "#556B2F",
              "#FF8C00",
              "#9932CC",
              "#8B0000",
              "#E9967A",
              "#8FBC8F",
              "#483D8B",
              "#2F4F4F",
              "#00CED1",
              "#9400D3",
              "#FF1493",
              "#00BFFF",
              "#696969",
              "#1E90FF",
              "#B22222",
              "#FFFAF0",
              "#228B22",
              "#DCDCDC",
              "#F8F8FF",
              "#FFD700",
              "#DAA520",
              "#ADFF2F",
              "#808080",
              "#F0FFF0",
              "#FF69B4",
              "#CD5C5C",
              "#4B0082",
              "#FFFFF0",
              "#F0E68C",
              "#E6E6FA",
              "#FFF0F5",
              "#7CFC00",
            ],
          },
        ],
      };
      return <Pie data={data} />;
    }
  };
  const renderTopViewedMovies = () => {
    if (viewType.topViewed === "list") {
      return (
        <ul>
          {stats.topViewedMovies.map((movie) => (
            <li key={movie._id} className="flex justify-between py-2">
              <span>{movie.name}</span>
              <span className="font-semibold">{movie.viewCount}</span>
            </li>
          ))}
        </ul>
      );
    } else {
      const data = {
        labels: stats.topViewedMovies.map((movie) => movie.name),
        datasets: [
          {
            data: stats.topViewedMovies.map((movie) => movie.viewCount),
            backgroundColor: [
              "#FF6384",
              "#36A2EB",
              "#FFCE56",
              "#4BC0C0",
              "#9966FF",
              "#FF9F40",
              "#F7464A",
              "#46BFBD",
              "#FDB45C",
            ],
          },
        ],
      };
      return <Pie data={data} />;
    }
  };
  const renderTopRatedMovies = () => {
    if (viewType.topRated === "list") {
      return (
        <ul>
          {stats.topRatedMovies.map((movie) => (
            <li key={movie._id} className="flex justify-between py-2">
              <span>{movie.name}</span>
              <span className="font-semibold">
                {movie.averageRating.toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
      );
    } else {
      const data = {
        labels: stats.topRatedMovies.map((movie) => movie.name),
        datasets: [
          {
            data: stats.topRatedMovies.map((movie) => movie.averageRating),
            backgroundColor: [
              "#FF6384",
              "#36A2EB",
              "#FFCE56",
              "#4BC0C0",
              "#9966FF",
              "#FF9F40",
              "#F7464A",
              "#46BFBD",
              "#FDB45C",
              "#949FB1",
            ],
          },
        ],
      };
      return <Pie data={data} />;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Số lượng phim theo thể loại */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-center">
              Số lượng phim theo thể loại
            </h2>
            <div className="flex">
              <button
                className={`px-4 py-2 rounded-l-lg ${
                  viewType.category === "list"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                }`}
                onClick={() => setViewType({ ...viewType, category: "list" })}
              >
                List
              </button>
              <button
                className={`px-4 py-2 rounded-r-lg ${
                  viewType.category === "chart"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                }`}
                onClick={() => setViewType({ ...viewType, category: "chart" })}
              >
                Chart
              </button>
            </div>
          </div>
          {renderMoviesByCategory()}
        </div>

        {/* Số lượng phim theo năm sản xuất */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-center">
              Số lượng phim theo năm sản xuất
            </h2>
            <div className="flex">
              <button
                className={`px-4 py-2 rounded-l-lg ${
                  viewType.year === "list"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                }`}
                onClick={() => setViewType({ ...viewType, year: "list" })}
              >
                List
              </button>
              <button
                className={`px-4 py-2 rounded-r-lg ${
                  viewType.year === "chart"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                }`}
                onClick={() => setViewType({ ...viewType, year: "chart" })}
              >
                Chart
              </button>
            </div>
          </div>
          {renderMoviesByYear()}
        </div>

        {/* Top phim được xem nhiều nhất */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-center">
              Top phim được xem nhiều nhất
            </h2>
            <div className="flex">
              <button
                className={`px-4 py-2 rounded-l-lg ${
                  viewType.topViewed === "list"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                }`}
                onClick={() => setViewType({ ...viewType, topViewed: "list" })}
              >
                List
              </button>
              <button
                className={`px-4 py-2 rounded-r-lg ${
                  viewType.topViewed === "chart"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                }`}
                onClick={() => setViewType({ ...viewType, topViewed: "chart" })}
              >
                Chart
              </button>
            </div>
          </div>
          {renderTopViewedMovies()}
        </div>

        {/* Top phim được đánh giá cao nhất */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-center">
              Top phim được đánh giá cao nhất
            </h2>
            <div className="flex">
              <button
                className={`px-4 py-2 rounded-l-lg ${
                  viewType.topRated === "list"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                }`}
                onClick={() => setViewType({ ...viewType, topRated: "list" })}
              >
                List
              </button>
              <button
                className={`px-4 py-2 rounded-r-lg ${
                  viewType.topRated === "chart"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                }`}
                onClick={() => setViewType({ ...viewType, topRated: "chart" })}
              >
                Chart
              </button>
            </div>
          </div>
          {renderTopRatedMovies()}
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
