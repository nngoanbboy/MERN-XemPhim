const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");
const authMiddleware = require("../middlewares/authmiddleware");
const reportCommentController = require("../controllers/reportCommentController");

// Route để lấy tất cả bình luận cho một bộ phim cụ thể
router.get("/:movieId", commentController.getComments);
//Sửa
router.put(
  "/:commentId",
  authMiddleware.authenticate,
  commentController.updateComment
);
// Route để thêm bình luận mới (yêu cầu xác thực)
router.post(
  "/:movieId",
  authMiddleware.authenticate,
  commentController.addComment
);

//  xóa bình luận
router.delete(
  "/:commentId",
  authMiddleware.authenticate,
  commentController.deleteComment
);
//lay bình luận cua 1 user
router.get("/user/:userId", commentController.getUserComments);

module.exports = router;
