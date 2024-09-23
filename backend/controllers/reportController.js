const Report = require("../models/Report");
const axios = require("axios");
const { populate } = require("../models/episodeModel");
const Movie = require("../models/movieModel");

//Tạo báo cáo phim
exports.reportIssue = async (req, res) => {
  console.log("User từ request:", req.user);
  console.log("Body của request:", req.body);
  try {
    const { movieId, episodeNumber, description } = req.body;

    // Input validation
    if (!movieId || !episodeNumber || !description) {
      return res.status(400).json({ message: "Thiếu thông tin báo cáo" });
    }

    // Check if user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Người dùng chưa xác thực" });
    }

    const userId = req.user._id;

    const newReport = new Report({
      movie: movieId,
      episode: episodeNumber,
      description,
      user: userId,
    });

    await newReport.save();

    res.status(201).json({ message: "Báo cáo đã được gửi thành công" });
  } catch (error) {
    console.error("Error in reportIssue:", error);
    res
      .status(500)
      .json({ message: "Lỗi server khi xử lý báo cáo", error: error.message });
  }
};
//Lấy dữ liệu báo cáo
exports.getReports = async (req, res) => {
  try {
    console.log("Request user:", req.user); // Kiểm tra user từ request
    const reports = await Report.find().populate("movie").exec();
    console.log("Reports:", reports); // Kiểm tra dữ liệu báo cáo
    res.status(200).json(reports);
  } catch (error) {
    console.error("Lỗi trong getReports:", error);
    res
      .status(500)
      .json({ message: "Lỗi server khi lấy báo cáo", error: error.message });
  }
};
//Xử lý báo cáo
exports.resolveReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const report = await Report.findByIdAndUpdate(
      reportId,
      { resolved: true },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({ message: "Không tìm thấy báo cáo" });
    }

    res.json({ message: "Báo cáo đã được đánh dấu là đã xử lý", report });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
//Xóa báo cáo
exports.deleteReport = async (req, res) => {
  try {
    const reportId = req.params.reportId;

    // Kiểm tra xem báo cáo có tồn tại không
    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: "Không tìm thấy báo cáo" });
    }

    // Kiểm tra xem báo cáo đã được xử lý chưa
    if (!report.resolved) {
      return res
        .status(400)
        .json({ message: "Chỉ có thể xóa báo cáo đã xử lý" });
    }

    // Xóa báo cáo
    await Report.findByIdAndDelete(reportId);

    res.status(200).json({ message: "Báo cáo đã được xóa thành công" });
  } catch (error) {
    console.error("Lỗi khi xóa báo cáo:", error);
    res.status(500).json({ message: "Đã xảy ra lỗi khi xóa báo cáo" });
  }
};
