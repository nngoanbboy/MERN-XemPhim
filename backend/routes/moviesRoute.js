// routes/movie.js
const express = require("express");
const router = express.Router();
const movieController = require("../controllers/movieController");
const authMiddleware = require("../middlewares/authmiddleware");
const commentController = require("../controllers/commentController");
const ratingController = require("../controllers/ratingController");
console.log(ratingController);

//Lay danh sach phim
router.get(
  "/fetch-movies",
  authMiddleware.authenticate,
  authMiddleware.authorizeAdmin,
  movieController.fetchAndSaveMovies
);
//Lay danh sach phim moinhat
router.get(
  "/newmovies",
  authMiddleware.authenticate,
  movieController.getNewMovies
);
// Them phim
router.post(
  "/",
  authMiddleware.authenticate,
  authMiddleware.authorizeAdmin,
  movieController.addMovie
);
//Lay tat ca phim
router.get("/", movieController.getAllMovies);
//Lay phim theo slug
router.get("/duongdan/:slug", movieController.getMovieBySlug);
router.get(
  "/duongdan/:duongdan/tap-:tap",
  movieController.getMovieBySlugAndEpisode
);

//get movie by id
//router.get('/:movieId', movieController.getMovieById);

//Lay phim theo Theloai
router.get("/category/:category", movieController.getMoviesByCategory);
//Lay phim theo quocgia
router.get("/country/:country", movieController.getMovieByCountry);
//Lay phim theo phimle
router.get("/single", movieController.getSingleMovies);
//Lay phim theo phimbo
router.get("/series", movieController.getSeriesMovies);
//Lay phim de xuat
router.get("/suggested", movieController.getSuggestionMovies);
//Tim kiem
router.get("/search", movieController.searchMovies);
//Lay phim ngau nhien
router.get("/random", movieController.getRandomMovie);
//Them vao yeu thich
router.post(
  "/favorite/:id",
  authMiddleware.authenticate,
  movieController.toggleFavorite
);
//lay danh sach yeu thich
router.get(
  "/favorites",
  authMiddleware.authenticate,
  movieController.getFavorites
);
//kiem tra trang thai yeu thich
router.get(
  "/favorite/:id",
  authMiddleware.authenticate,
  movieController.checkFavoriteStatus
);

// Cap nhap phim
router.put(
  "/:movieId",
  authMiddleware.authenticate,
  authMiddleware.authorizeAdmin,
  movieController.updateMovie
);
//Xoa phim
router.delete(
  "/:movieId",
  authMiddleware.authenticate,
  authMiddleware.authorizeAdmin,
  movieController.deleteMovie
);
// Thêm vào lịch sử khi xem phim
router.post(
  "/history",
  authMiddleware.authenticate,
  movieController.addToHistory
);

// Lấy lịch sử xem phim
router.get("/history", authMiddleware.authenticate, movieController.getHistory);
//Xóa
router.delete(
  "/history/all",
  authMiddleware.authenticate,
  movieController.clearAllHistory
);
router.delete(
  "/history/:historyId",
  authMiddleware.authenticate,
  movieController.deleteHistoryItem
);

//Binh luan
router.post(
  "/:movieId/comments",
  authMiddleware.authenticate,
  commentController.addComment
);
//Xoa binh luan
router.delete(
  "/comments/:commentId",
  authMiddleware.authenticate,
  commentController.deleteComment
);
//rating movie
router.post(
  "/:movieId/ratings",
  authMiddleware.authenticate,
  ratingController.addRating
);

// thêm tập phim
router.post(
  "/:movieId/episodes",
  authMiddleware.authenticate,
  authMiddleware.authorizeAdmin,
  movieController.addEpisodeToMovie
);
//Cap nhat tap
router.put(
  "/:movieId/episodes/:episodeId",
  authMiddleware.authenticate,
  authMiddleware.authorizeAdmin,
  movieController.updateEpisode
);
//Xoa tap
router.delete(
  "/:movieId/episodes/:episodeId",
  authMiddleware.authenticate,
  authMiddleware.authorizeAdmin,
  movieController.deleteEpisode
);
router.post(
  "/:movieId/ratings",
  authMiddleware.authenticate,
  ratingController.addRating
);
router.get("/:movieId/ratings", ratingController.getRating);
router.get(
  "/admin/stats",

  movieController.getAdminStats
);

module.exports = router;
