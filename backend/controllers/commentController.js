const Comment = require("../models/commentModel");
const Movie = require("../models/movieModel");
const jwt = require("jsonwebtoken");

// Thêm Bình Luận
exports.addComment = async (req, res) => {
  try {
    const { movieId } = req.params;
    const { comment } = req.body;
    const userId = req.user._id;

    const newComment = new Comment({
      comment,
      user: userId,
      movie: movieId,
    });

    await newComment.save();

    // Populate thông tin người dùng sau khi lưu
    await newComment.populate("user", "username");

    const movie = await Movie.findById(movieId);
    movie.comments.push(newComment._id);
    await movie.save();

    res.json({
      status: true,
      msg: "Comment added successfully",
      comment: newComment,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      msg: "Failed to add comment",
      error: err.message,
    });
  }
};
//Sửa Bình luận
exports.updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { comment } = req.body;
    const userId = req.user._id;

    const existingComment = await Comment.findById(commentId);

    if (!existingComment) {
      return res.status(404).json({ status: false, msg: "Comment not found" });
    }

    if (existingComment.user.toString() !== userId.toString()) {
      return res.status(403).json({
        status: false,
        msg: "You do not have permission to edit this comment",
      });
    }

    existingComment.comment = comment;
    await existingComment.save();

    // Populate user information
    await existingComment.populate("user", "username");

    res.json({
      status: true,
      msg: "Comment updated successfully",
      comment: existingComment,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      msg: "Failed to update comment",
      error: err.message,
    });
  }
};

// Xóa Bình Luận
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ status: false, msg: "Comment not found" });
    }

    // Kiểm tra quyền sở hữu hoặc quyền admin
    if (comment.user.toString() !== req.user._id && !req.user.isAdmin) {
      return res.status(403).json({
        status: false,
        msg: "You do not have permission to delete this comment",
      });
    }

    // thực hiện Xóa bình luận
    await Comment.deleteOne({ _id: comment._id });

    // Xóa bình luận khỏi phim
    const movie = await Movie.findById(comment.movie);
    if (movie) {
      movie.comments.pull(comment._id);
      await movie.save();
    }

    res.json({ status: true, msg: "Comment deleted successfully" });
  } catch (err) {
    res.status(500).json({
      status: false,
      msg: "Failed to delete comment",
      error: err.message,
    });
  }
};
//Lấy Dữ Liệu  Bình Luận của một Phim
exports.getComments = async (req, res) => {
  try {
    const { movieId } = req.params;
    const comments = await Comment.find({ movie: movieId })
      .populate("user", "username") // Populate thông tin người dùng, chỉ lấy trường 'name'
      .sort({ created: -1 }); // Sắp xếp theo thời gian tạo, mới nhất lên đầu

    res.json({ status: true, comments });
  } catch (err) {
    res.status(500).json({
      status: false,
      msg: "Failed to get comments",
      error: err.message,
    });
  }
};
// Lấy bình luận của một người dùng cụ thể
exports.getUserComments = async (req, res) => {
  try {
    const { userId } = req.params;
    const comments = await Comment.find({ user: userId })
      .populate("movie", "name") // Populate thông tin bộ phim
      .sort({ created: -1 }); // Sắp xếp theo thời gian tạo, mới nhất lên đầu

    res.json({ status: true, comments });
  } catch (err) {
    res.status(500).json({
      status: false,
      msg: "Failed to get user comments",
      error: err.message,
    });
  }
};
