const ReportComment = require("../models/reportCommentModel");

//Tạo tố cáo bình luận
exports.createReportComment = async (req, res) => {
  try {
    const { reason } = req.body;
    const { commentId } = req.params;

    console.log("Received report:", {
      commentId,
      reason,
      userId: req.user?._id,
    });

    if (!req.user || !req.user._id) {
      return res
        .status(401)
        .json({ message: "User not authenticated or user ID missing" });
    }

    if (!reason) {
      return res
        .status(400)
        .json({ message: "Reason for reporting is required" });
    }

    const report = new ReportComment({
      comment: commentId,
      user: req.user._id,
      reason: reason,
    });

    await report.save();

    res.status(201).json({ message: "Comment report created successfully" });
  } catch (error) {
    console.error("Error in createReportComment:", error);
    res
      .status(500)
      .json({ message: "Error creating comment report", error: error.message });
  }
};
//Lấy dữ liệu báo cáo bình luận
exports.getAllReportComments = async (req, res) => {
  try {
    const reports = await ReportComment.find()
      .populate("comment")
      .populate("user", "username");
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching comment reports",
      error: error.message,
    });
  }
};
//Xử lý báo cáo bình luận
exports.resolveReportComment = async (req, res) => {
  try {
    const report = await ReportComment.findByIdAndUpdate(
      req.params.id,
      { resolved: true },
      { new: true }
    );
    if (!report) {
      return res.status(404).json({ message: "Comment report not found" });
    }
    res
      .status(200)
      .json({ message: "Comment report resolved successfully", report });
  } catch (error) {
    res.status(500).json({
      message: "Error resolving comment report",
      error: error.message,
    });
  }
};
//Lấy dữ liệu báo cáo bình luận theo ID
exports.getReportsByCommentId = async (req, res) => {
  try {
    const { commentId } = req.params;

    // Kiểm tra xem người dùng đã đăng nhập chưa
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        message: "Người dùng chưa đăng nhập hoặc thiếu ID người dùng",
      });
    }

    // Tìm các báo cáo cho bình luận cụ thể
    const reports = await ReportComment.find({ comment: commentId }).populate(
      "user",
      "username"
    );

    res.status(200).json(reports);
  } catch (error) {
    console.error("Lỗi khi lấy các báo cáo:", error);
    res
      .status(500)
      .json({ message: "Lỗi server nội bộ", error: error.message });
  }
};
//Xóa báo cáo bình luận
exports.deleteReportComment = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await ReportComment.findByIdAndDelete(id);

    if (!report) {
      return res.status(404).json({ message: "Comment report not found" });
    }

    res.status(200).json({ message: "Comment report deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting comment report", error: error.message });
  }
};
