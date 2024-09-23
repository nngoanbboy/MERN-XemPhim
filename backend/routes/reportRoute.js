const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authmiddleware");
const reportController = require("../controllers/reportController");

// Route để người dùng báo cáo lỗi
router.post("/", authMiddleware.authenticate, reportController.reportIssue);

// Routes cho admin lấy báo cáo lỗi
router.get("/", authMiddleware.authenticate, reportController.getReports);
//Routes cho admin xử lý báo cáo lỗi
router.put(
  "/:reportId/resolve",
  authMiddleware.authenticate,
  reportController.resolveReport
);
//Routes cho admin xóa báo cáo lỗi
router.delete("/:reportId", reportController.deleteReport);

module.exports = router;
