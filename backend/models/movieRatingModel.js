const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  movie: { type: mongoose.Schema.Types.ObjectId, ref: "Movie", required: true },
  rating: { type: Number, required: true, min: 1, max: 10 },
  createdAt: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now }, // Thêm trường updated
});

// Đảm bảo mỗi người dùng chỉ có thể đánh giá một bộ phim một lần
ratingSchema.index({ user: 1, movie: 1 }, { unique: true });

// Phương thức tự động cập nhật trường 'updated'
ratingSchema.pre("save", function (next) {
  this.updated = Date.now();
  next();
});

module.exports = mongoose.model("Rating", ratingSchema);
