const Rating = require("../models/movieRatingModel");
const Movie = require("../models/movieModel");
const jwt = require("jsonwebtoken");

exports.addRating = async (req, res) => {
  try {
    const { movieId } = req.params;

    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded._id;

    const { rating } = req.body;

    // Kiểm tra xem người dùng đã đánh giá phim này chưa
    let existingRating = await Rating.findOne({ user: userId, movie: movieId });

    if (existingRating) {
      // Nếu đã tồn tại, cập nhật đánh giá
      existingRating.rating = rating;
      await existingRating.save();
      res.json({
        status: true,
        msg: "Rating updated successfully",
        rating: existingRating,
      });
    } else {
      // Nếu chưa tồn tại, tạo đánh giá mới
      const newRating = new Rating({
        rating,
        user: userId,
        movie: movieId,
      });

      await newRating.save();

      const movie = await Movie.findById(movieId);
      movie.ratings.push(newRating._id);
      await movie.save();

      res.json({
        status: true,
        msg: "Rating added successfully",
        rating: newRating,
      });
    }
  } catch (err) {
    res
      .status(500)
      .json({
        status: false,
        msg: "Failed to add/update rating",
        error: err.message,
      });
  }
};
exports.getRating = async (req, res) => {
  try {
    const { movieId } = req.params;
    const ratings = await Rating.find({ movie: movieId });

    const totalRatings = ratings.length;
    const averageRating =
      ratings.reduce((sum, rating) => sum + rating.rating, 0) / totalRatings ||
      0;

    res.json({ averageRating, totalRatings });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi lấy đánh giá", error: error.message });
  }
};
