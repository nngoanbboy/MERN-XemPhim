// controllers/movieController.js
const { populate } = require("../models/episodeModel");
const Movie = require("../models/movieModel");
const axios = require("axios");
const Favorite = require("../models/Favorite");
const History = require("../models/History");
const Genre = require("../models/genreModel");
const Report = require("../models/Report");

// Thêm một phim
exports.addMovie = async (req, res) => {
  try {
    console.log("Received movie data:", req.body); // Log dữ liệu request để kiểm tra

    const newMovie = new Movie(req.body);
    await newMovie.save();

    res.status(201).json(newMovie);
  } catch (error) {
    console.error("Error adding movie:", error); // Log lỗi
    res
      .status(500)
      .json({ msg: "Internal Server Error", error: error.message });
  }
};

//Cập nhật thong tin phim
exports.updateMovie = async (req, res) => {
  const movieId = req.params.movieId;
  const movieData = req.body;

  console.log("Received movieId:", movieId);
  console.log("Received movieData:", movieData);

  if (!movieData) {
    return res
      .status(400)
      .json({ status: false, error: "Movie data is undefined" });
  }

  try {
    if (movieData.category && movieData.category.length > 0) {
      const categoryIds = movieData.category.map((genre) => genre.id);
      console.log("Category IDs:", categoryIds);

      const genres = await Genre.find({
        _id: { $in: categoryIds },
      });

      movieData.category = genres.map((genre) => ({
        id: genre._id.toString(),
        name: genre.name,
        slug: genre.slug,
      }));
    }

    const updatedMovie = await Movie.findByIdAndUpdate(movieId, movieData, {
      new: true,
    });

    if (!updatedMovie) {
      return res.status(404).json({ status: false, error: "Movie not found" });
    }

    res.json({ status: true, data: updatedMovie });
  } catch (error) {
    console.error("Error updating movie:", error);
    console.error("Error details:", error.stack); // Log thêm chi tiết lỗi
    res.status(500).json({
      status: false,
      error: "An error occurred while updating the movie",
    });
  }
};

//  thêm tập phim
exports.addEpisodeToMovie = async (req, res) => {
  const movieId = req.params.movieId;
  const episodeData = req.body.episodes?.server_data || req.body.episode;

  try {
    const movie = await Movie.findById(movieId);

    if (!movie) {
      return res.status(404).json({ status: false, msg: "Movie not found" });
    }

    let vietsub1Server = movie.episodes.find(
      (ep) => ep.server_name === "Vietsub #1"
    );

    if (vietsub1Server) {
      // Nếu server đã tồn tại
      if (
        vietsub1Server.server_data.length === 1 &&
        vietsub1Server.server_data[0] === null
      ) {
        // Nếu server_data chỉ chứa null, thay thế nó bằng mảng mới
        vietsub1Server.server_data = Array.isArray(episodeData)
          ? episodeData
          : [episodeData];
      } else {
        // Nếu server_data không phải null, thêm episode(s) mới vào mảng
        vietsub1Server.server_data =
          vietsub1Server.server_data.concat(episodeData);
      }
    } else {
      // Nếu server chưa tồn tại, tạo mới
      movie.episodes.push({
        server_name: "Vietsub #1",
        server_data: Array.isArray(episodeData) ? episodeData : [episodeData],
      });
    }

    // Sắp xếp episodes theo thứ tự tăng dần của số tập
    if (vietsub1Server && Array.isArray(vietsub1Server.server_data)) {
      vietsub1Server.server_data.sort(
        (a, b) => parseInt(a.name) - parseInt(b.name)
      );
    }

    // Đánh dấu trường episodes là đã sửa đổi để Mongoose cập nhật nó
    movie.markModified("episodes");

    // Lưu thay đổi
    const updatedMovie = await movie.save();

    res.json({
      status: true,
      msg: "Episode(s) added successfully",
      movie: updatedMovie,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      msg: "Failed to add episode(s)",
      error: err.message,
    });
  }
};
// Sửa tập phim
exports.updateEpisode = async (req, res) => {
  const { movieId, episodeId } = req.params;
  const updatedEpisodeData = req.body.episode;

  try {
    const movie = await Movie.findById(movieId);

    if (!movie) {
      return res.status(404).json({ status: false, msg: "Movie not found" });
    }

    const vietsub1Server = movie.episodes.find(
      (ep) => ep.server_name === "Vietsub #1"
    );

    if (!vietsub1Server) {
      return res.status(404).json({ status: false, msg: "Server not found" });
    }

    const episodeIndex = vietsub1Server.server_data.findIndex(
      (ep) => ep._id.toString() === episodeId
    );

    if (episodeIndex === -1) {
      return res.status(404).json({ status: false, msg: "Episode not found" });
    }

    // Cập nhật thông tin tập phim
    vietsub1Server.server_data[episodeIndex] = {
      ...vietsub1Server.server_data[episodeIndex],
      ...updatedEpisodeData,
    };

    // Sắp xếp lại các tập theo thứ tự tăng dần
    vietsub1Server.server_data.sort(
      (a, b) => parseInt(a.name) - parseInt(b.name)
    );

    movie.markModified("episodes");
    await movie.save();

    res.json({
      status: true,
      msg: "Episode updated successfully",
      episode: vietsub1Server.server_data[episodeIndex],
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      msg: "Failed to update episode",
      error: err.message,
    });
  }
};
// Xóa tập phim
exports.deleteEpisode = async (req, res) => {
  const { movieId, episodeId } = req.params;

  try {
    const movie = await Movie.findById(movieId);

    if (!movie) {
      return res.status(404).json({ status: false, msg: "Movie not found" });
    }

    const vietsub1Server = movie.episodes.find(
      (ep) => ep.server_name === "Vietsub #1"
    );

    if (!vietsub1Server) {
      return res.status(404).json({ status: false, msg: "Server not found" });
    }

    const episodeIndex = vietsub1Server.server_data.findIndex(
      (ep) => ep._id.toString() === episodeId
    );

    if (episodeIndex === -1) {
      return res.status(404).json({ status: false, msg: "Episode not found" });
    }

    // Xóa tập phim
    vietsub1Server.server_data.splice(episodeIndex, 1);

    // Nếu không còn tập nào, đặt server_data về [null]
    if (vietsub1Server.server_data.length === 0) {
      vietsub1Server.server_data = [null];
    }

    movie.markModified("episodes");
    await movie.save();

    res.json({
      status: true,
      msg: "Episode deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      msg: "Failed to delete episode",
      error: err.message,
    });
  }
};

//Get all movies
//Lấy tất cả phim
exports.getAllMovies = async (req, res) => {
  try {
    console.log("Getting all movies...");
    const movies = await Movie.find({}).lean().exec();
    const totalMovies = await Movie.countDocuments();
    console.log(`Total movies in database: ${totalMovies}`);
    res.json({ status: true, movies, totalMovies });
  } catch (err) {
    console.error("Error getting movies:", err);
    res
      .status(500)
      .json({ status: false, msg: "Failed to get movies", error: err.message });
  }
};
//Lấy phim theo id
exports.getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.movieId);
    res.json({ status: true, movie });
  } catch (err) {
    res
      .status(500)
      .json({ status: false, msg: "Failed to get movie", error: err.message });
  }
};
//Xóa phim
exports.deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.movieId);
    if (!movie) {
      return res.status(404).json({ status: false, msg: "Movie not found" });
    }
    res.json({ status: true, msg: "Movie deleted successfully" });
  } catch (err) {
    res.status(500).json({
      status: false,
      msg: "Failed to delete movie",
      error: err.message,
    });
  }
};
//Lấy phim mới
exports.getNewMovies = async (req, res) => {
  try {
    const newMovies = await Movie.find().sort({ createdAt: -1 }).limit(10);
    res.json(newMovies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
//Lấy phim theo slug
exports.getMovieBySlug = async (req, res) => {
  const { slug } = req.params;
  try {
    const movie = await Movie.findOne({ slug });

    if (!movie) {
      return res.status(404).json({ status: false, msg: "Movie not found" });
    }
    res.json({ status: true, movie });
  } catch (err) {
    res
      .status(500)
      .json({ status: false, msg: "Failed to get movie", error: err.message });
  }
};
//Lấy phim từ API
exports.fetchAndSaveMovies = async (req, res) => {
  try {
    let totalMoviesAdded = 0;
    let totalMoviesUpdated = 0;
    let totalMoviesUnchanged = 0;

    const initialCount = await Movie.countDocuments();
    console.log(`Initial movie count: ${initialCount}`);

    for (let page = 308; page <= 309; page++) {
      let pageMoviesAdded = 0;
      let pageMoviesUpdated = 0;
      let pageMoviesUnchanged = 0;

      try {
        console.log(`Fetching data for page ${page}`);
        const response = await axios.get(
          `https://ophim1.com/danh-sach/phim-moi-cap-nhat?page=${page}`
        );
        const movies = response.data.items;

        if (movies.length === 0) {
          console.log(`No more movies found after page ${page - 1}`);
          break;
        }

        for (const movieData of movies) {
          try {
            console.log(`Processing movie: ${movieData.slug}`);
            const detailResponse = await axios.get(
              `https://ophim1.com/phim/${movieData.slug}`
            );
            const movieDetail = detailResponse.data.movie;
            const episodes = detailResponse.data.episodes;

            const movie = {
              name: movieDetail.name,
              origin_name: movieDetail.origin_name,
              content: movieDetail.content,
              type: movieDetail.type,
              status: movieDetail.status,
              thumb_url: movieDetail.thumb_url,
              trailer_url: movieDetail.trailer_url,
              poster_url: movieDetail.poster_url,
              year: movieDetail.year,
              time: movieDetail.time,
              episode_current: movieDetail.episode_current,
              episode_total: movieDetail.episode_total,
              quality: movieDetail.quality,
              lang: movieDetail.lang,
              slug: movieDetail.slug,
              actor: movieDetail.actor,
              director: movieDetail.director,
              category: movieDetail.category,
              country: movieDetail.country,
              episodes: episodes,
            };

            const existingMovie = await Movie.findOne({ slug: movie.slug });

            if (existingMovie) {
              console.log(
                `Existing movie found: ${movie.name}. Checking for updates...`
              );
              const existingMovieObject = existingMovie.toObject();
              delete existingMovieObject._id;
              delete existingMovieObject.__v;

              const needsUpdate =
                JSON.stringify(existingMovieObject) !== JSON.stringify(movie);

              if (needsUpdate) {
                await Movie.findOneAndUpdate({ slug: movie.slug }, movie, {
                  new: true,
                });
                totalMoviesUpdated++;
                pageMoviesUpdated++;
                console.log(`Updated movie: ${movie.name}`);
              } else {
                totalMoviesUnchanged++;
                pageMoviesUnchanged++;
                console.log(`No changes for movie: ${movie.name}`);
              }
            } else {
              console.log(`New movie found: ${movie.name}. Adding...`);
              const newMovie = new Movie(movie);
              await newMovie.save();
              totalMoviesAdded++;
              pageMoviesAdded++;
              console.log(`Added new movie: ${movie.name}`);
            }
          } catch (movieError) {
            console.error(
              `Error processing movie ${movieData.slug}:`,
              movieError.message
            );
          }
        }

        console.log(`Completed processing page ${page}`);
        console.log(
          `Page ${page} summary: Added ${pageMoviesAdded}, Updated ${pageMoviesUpdated}, Unchanged ${pageMoviesUnchanged}`
        );

        // Thêm độ trễ để tránh gửi quá nhiều yêu cầu trong thời gian ngắn
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (pageError) {
        console.error(`Error fetching page ${page}:`, pageError.message);
        if (pageError.response && pageError.response.status === 404) {
          console.log(`Reached end of available pages at page ${page - 1}`);
          break;
        }
      }
    }

    const finalCount = await Movie.countDocuments();
    console.log(`Final movie count: ${finalCount}`);
    console.log(`Change in movie count: ${finalCount - initialCount}`);

    console.log(
      `Final summary: Total movies added: ${totalMoviesAdded}, Total movies updated: ${totalMoviesUpdated}, Total movies unchanged: ${totalMoviesUnchanged}`
    );

    res.json({
      status: true,
      msg: `Movies fetched and saved successfully. Added: ${totalMoviesAdded}, Updated: ${totalMoviesUpdated}, Unchanged: ${totalMoviesUnchanged}`,
      initialCount,
      finalCount,
      change: finalCount - initialCount,
    });
  } catch (err) {
    console.error("Failed to fetch and save movies:", err);
    res.status(500).json({
      status: false,
      msg: "Failed to fetch and save movies",
      error: err.message,
    });
  }
};
//Lấy phim theo thể loại
exports.getMoviesByCategory = async (req, res) => {
  const { category } = req.params;
  try {
    // Sử dụng category.slug để truy vấn mảng category
    const movies = await Movie.find({ "category.slug": category }).select(
      "name type thumb_url slug year country "
    );
    res.json({ status: true, movies });
  } catch (err) {
    res
      .status(500)
      .json({ status: false, msg: "Failed to get movies", error: err.message });
  }
};
//Lấy phim ngẫu nhiên
exports.getRandomMovie = async (req, res) => {
  try {
    // Đếm tổng số phim trong cơ sở dữ liệu
    const count = await Movie.countDocuments();

    if (count === 0) {
      return res
        .status(404)
        .json({ status: false, msg: "Không có phim nào trong database" });
    }

    // Chọn ngẫu nhiên một vị trí trong danh sách phim
    const random = Math.floor(Math.random() * count);
    // Lấy phim từ vị trí đã chọn
    const randomMovie = await Movie.findOne()
      .skip(random)
      .select("name thumb_url id age_rating slug");

    if (!randomMovie) {
      return res
        .status(404)
        .json({ status: false, msg: "Không tìm thấy phim" });
    }

    res.json({ status: true, movie: randomMovie });
  } catch (error) {
    console.error("Lỗi khi lấy phim ngẫu nhiên:", error);
    res.status(500).json({ error: error.message });
  }
};
//Lấy phim theo quốc gia
exports.getMovieByCountry = async (req, res) => {
  const { country } = req.params;
  try {
    const movies = await Movie.find({ "country.slug": country }).select(
      "name type thumb_url slug year category "
    );
    res.json({ status: true, movies });
  } catch (err) {
    res
      .status(500)
      .json({ status: false, msg: "Failed to get movies", error: err.message });
  }
};
//Lấy Phim Lẻ
exports.getSingleMovies = async (req, res) => {
  try {
    const singleMovies = await Movie.find({ type: "single" }).sort({
      createdAt: -1,
    });
    res.json(singleMovies);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching single movies", error: error.message });
  }
};
//Lây phim Bộ
exports.getSeriesMovies = async (req, res) => {
  try {
    const seriesMovies = await Movie.find({ type: "series" }).sort({
      createdAt: -1,
    });
    res.json(seriesMovies);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching series movies", error: error.message });
  }
};
//Lây phim đề xuất
exports.getSuggestionMovies = async (req, res) => {
  try {
    // Đếm tổng số phim trong cơ sở dữ liệu
    const count = await Movie.countDocuments();

    if (count === 0) {
      return res
        .status(404)
        .json({ status: false, msg: "Không có phim nào trong database" });
    }

    // Chọn 6 phim ngẫu nhiên có rating
    const movies = await Movie.aggregate([
      // Lookup để lấy ratings
      // Chọn ngẫu nhiên

      {
        $lookup: {
          from: "ratings",
          localField: "_id",
          foreignField: "movie",
          as: "ratings",
        },
      },
      // Lọc các phim có ít nhất một rating
      {
        $match: {
          ratings: { $ne: [] },
        },
      },
      // Tính trung bình rating
      {
        $addFields: {
          averageRating: {
            $cond: [
              { $eq: [{ $size: "$ratings" }, 0] },
              0,
              { $avg: "$ratings.rating" },
            ],
          },
        },
      },
      { $sample: { size: 6 } },
      { $sort: { averageRating: -1 } },
    ]);

    res.json({ status: true, movies });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Error fetching some suggestion movies",
      error: error.message,
    });
  }
};
const removeAccents = (str) => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
};

// tìm kiếm phim
const generateSearchTerms = (str) => {
  const words = removeAccents(str).split(/\s+/);
  let terms = [];
  for (let i = 1; i <= words.length; i++) {
    for (let j = 0; j <= words.length - i; j++) {
      terms.push(words.slice(j, j + i).join(" "));
    }
  }
  return terms;
};

// tìm kiếm phim

exports.searchMovies = async (req, res) => {
  const { term, genre, country, year, type, actor, director } = req.query;
  try {
    let query = {};
    if (genre) {
      query["category.slug"] = genre;
    }
    if (country) {
      query["country.slug"] = country;
    }
    if (year) {
      query.year = parseInt(year);
    }
    if (type) {
      query.type = type;
    }
    if (actor) {
      query.actor = { $regex: actor, $options: "i" };
    }

    if (director) {
      query.director = { $regex: director, $options: "i" };
    }

    let movies = await Movie.find(query).select(
      "name thumb_url slug year actor director"
    );

    if (term) {
      const searchTerms = generateSearchTerms(term);
      const normalizedTerm = removeAccents(term);

      // Tính điểm khớp cho mỗi phim
      movies = movies.map((movie) => {
        const movieTerms = generateSearchTerms(movie.name);
        const normalizedMovieName = removeAccents(movie.name);
        let matchScore = 0;

        // Khớp chính xác
        if (normalizedMovieName === normalizedTerm) {
          matchScore = Number.MAX_SAFE_INTEGER;
        } else {
          // Tính điểm dựa trên số lượng từ khớp
          searchTerms.forEach((searchTerm) => {
            if (
              movieTerms.some((movieTerm) => movieTerm.includes(searchTerm))
            ) {
              matchScore += searchTerm.split(" ").length;
            }
          });

          // Cộng thêm điểm nếu tên phim chứa toàn bộ từ khóa tìm kiếm
          if (normalizedMovieName.includes(normalizedTerm)) {
            matchScore += normalizedTerm.split(" ").length * 2;
          }
        }

        return { ...movie.toObject(), matchScore };
      });

      // Sắp xếp theo điểm khớp giảm dần
      movies.sort((a, b) => b.matchScore - a.matchScore);

      // Chỉ giữ lại các phim có điểm khớp cao nhất
      const highestScore = movies[0].matchScore;
      movies = movies.filter((movie) => movie.matchScore === highestScore);

      // Loại bỏ trường matchScore khỏi kết quả cuối cùng
      movies = movies.map(({ matchScore, ...movie }) => movie);
    }

    res.json({ movies });
  } catch (err) {
    res.status(500).json({
      status: false,
      msg: "Failed to search movies",
      error: err.message,
    });
  }
};

function calculateMatchScore(movie, searchTerms) {
  let score = 0;
  const { term, actor, director } = searchTerms;

  if (term) {
    score += getFieldMatchScore(movie.name, term) * 3; // Ưu tiên tên phim
    score += getFieldMatchScore(movie.actor, term);
    score += getFieldMatchScore(movie.director, term);
  }
  if (actor) score += getFieldMatchScore(movie.actor, actor) * 2;
  if (director) score += getFieldMatchScore(movie.director, director) * 2;

  return score;
}

function calculateMatchScore(searchTerm, fieldValue) {
  const searchTerms = generateSearchTerms(searchTerm);
  const normalizedSearchTerm = removeAccents(searchTerm);
  const normalizedFieldValue = removeAccents(fieldValue);
  const fieldTerms = generateSearchTerms(fieldValue);

  let score = 0;

  // Khớp chính xác
  if (normalizedFieldValue === normalizedSearchTerm) {
    return Number.MAX_SAFE_INTEGER;
  }

  // Tính điểm dựa trên số lượng từ khớp
  searchTerms.forEach((term) => {
    if (fieldTerms.some((fieldTerm) => fieldTerm.includes(term))) {
      score += term.split(" ").length;
    }
  });

  // Cộng thêm điểm nếu giá trị chứa toàn bộ từ khóa tìm kiếm
  if (normalizedFieldValue.includes(normalizedSearchTerm)) {
    score += normalizedSearchTerm.split(" ").length * 2;
  }

  return score;
}
//Bật yeu thich phim
exports.toggleFavorite = async (req, res) => {
  try {
    const movieId = req.params.id;
    const userId = req.user._id;

    const existingFavorite = await Favorite.findOne({
      user: userId,
      movie: movieId,
    });

    if (existingFavorite) {
      await Favorite.findByIdAndDelete(existingFavorite._id);
      res.json({ isFavorite: false });
    } else {
      await Favorite.create({ user: userId, movie: movieId });
      res.json({ isFavorite: true });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error toggling favorite", error: error.message });
  }
};
//lay danh sach phim yeu thich
exports.getFavorites = async (req, res) => {
  try {
    const userId = req.user._id;
    const favorites = await Favorite.find({ user: userId })
      .populate("movie")
      .sort({ createdAt: -1 });

    res.json({ favorites: favorites.map((f) => f.movie) });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching favorites", error: error.message });
  }
};
//Kiem tra phim co trong danh sach yeu thich hay khong
exports.checkFavoriteStatus = async (req, res) => {
  try {
    const movieId = req.params.id;
    const userId = req.user._id;
    const existingFavorite = await Favorite.findOne({
      user: userId,
      movie: movieId,
    });

    res.json({ isFavorite: !!existingFavorite });
  } catch (error) {
    res.status(500).json({
      message: "Error checking favorite status",
      error: error.message,
    });
  }
};
//Them vao danh sach phim da xem
exports.addToHistory = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("User:", req.user);
    const { movieId } = req.body;
    const userId = req.user._id;
    console.log("MovieId:", movieId, "UserId:", userId);

    let history = await History.findOne({ user: userId, movie: movieId });

    if (history) {
      history.watchedAt = Date.now();
      await history.save();
    } else {
      history = new History({
        user: userId,
        movie: movieId,
      });
      await history.save();
    }

    res.status(200).json({ status: true, message: "Added to history" });
  } catch (error) {
    console.error("Error in addToHistory:", error);
    res.status(500).json({
      status: false,
      message: "Error adding to history",
      error: error.toString(),
    });
  }
};
//lay danh sach phim da xem
exports.getHistory = async (req, res) => {
  try {
    console.log("User:", req.user);
    const userId = req.user._id;
    console.log("UserId:", userId);
    const history = await History.find({ user: userId })
      .sort({ watchedAt: -1 })
      .populate("movie", "name thumb_url slug year")
      .limit(20);

    res.json({ status: true, history });
  } catch (error) {
    console.error("Error in getHistory:", error);
    res.status(500).json({
      status: false,
      message: "Error fetching history",
      error: error.toString(),
    });
  }
};
//Xoa mot phim trong danh sach phim da xem
exports.deleteHistoryItem = async (req, res) => {
  try {
    const { historyId } = req.params;
    const userId = req.user._id;

    const deletedItem = await History.findOneAndDelete({
      _id: historyId,
      user: userId,
    });

    if (!deletedItem) {
      return res.status(404).json({
        status: false,
        message: "History item not found or not authorized to delete",
      });
    }

    res.json({ status: true, message: "History item deleted successfully" });
  } catch (error) {
    console.error("Error in deleteHistoryItem:", error);
    res.status(500).json({
      status: false,
      message: "Error deleting history item",
      error: error.toString(),
    });
  }
};
//Xoa tat ca phim trong danh sach phim da xem
exports.clearAllHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log("Clearing all history for user:", userId);
    const result = await History.deleteMany({ user: userId });
    console.log("Delete result:", result);
    res.json({
      status: true,
      message: "All history cleared successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error in clearAllHistory:", error);
    res.status(500).json({
      status: false,
      message: "Error clearing history",
      error: error.toString(),
    });
  }
};
//Lay thong tin phim theo slug va tap
exports.getMovieBySlugAndEpisode = async (req, res) => {
  try {
    const { duongdan, tap } = req.params;
    const movie = await Movie.findOne({ slug: duongdan });

    if (!movie) {
      return res.status(404).json({ message: "Không tìm thấy phim" });
    }

    res.json({ movie });
  } catch (error) {
    console.error("Error in getMovieBySlugAndEpisode:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
// Trong file movieController.js

exports.getAdminStats = async (req, res) => {
  try {
    const moviesByCategory = await Movie.aggregate([
      { $unwind: "$category" },
      { $group: { _id: "$category.name", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const moviesByYear = await Movie.aggregate([
      { $group: { _id: "$year", count: { $sum: 1 } } },
      { $sort: { _id: -1 } },
    ]);

    const topViewedMovies = await History.aggregate([
      {
        $group: {
          _id: "$movie",
          viewCount: { $sum: 1 },
        },
      },
      { $sort: { viewCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "movies",
          localField: "_id",
          foreignField: "_id",
          as: "movieDetails",
        },
      },
      {
        $unwind: "$movieDetails",
      },
      {
        $project: {
          _id: 0,
          name: "$movieDetails.name",
          viewCount: 1,
        },
      },
    ]);

    const topRatedMovies = await Movie.aggregate([
      {
        $lookup: {
          from: "ratings",
          localField: "_id",
          foreignField: "movie",
          as: "ratings",
        },
      },
      {
        $project: {
          name: 1,
          averageRating: { $avg: "$ratings.rating" },
        },
      },
      { $sort: { averageRating: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      moviesByCategory,
      moviesByYear,
      topViewedMovies,
      topRatedMovies,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching admin stats", error: error.message });
  }
};
