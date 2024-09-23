const express = require("express");
const router = express.Router();
const reportCommentController = require("../controllers/reportCommentController");
const authMiddleware = require("../middlewares/authmiddleware");

// Route cho người dùng báo cáo lỗi
router.post(
  "/:commentId",
  authMiddleware.authenticate,
  reportCommentController.createReportComment
);
// Routes cho admin lấy báo cáo lỗi
router.get(
  "/",
  authMiddleware.authenticate,
  reportCommentController.getAllReportComments
);
//Routes cho admin xử lý báo cáo lỗi
router.put(
  "/:id/resolve",
  authMiddleware.authenticate,
  reportCommentController.resolveReportComment
);
//Routes cho admin xóa báo cáo lỗi
router.delete(
  "/:id",
  authMiddleware.authenticate,
  reportCommentController.deleteReportComment
);

module.exports = router;
