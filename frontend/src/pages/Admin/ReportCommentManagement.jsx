import React, { useState, useEffect } from "react";
import axios from "axios";
import config from "../../config";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ReportCommentManagement = () => {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await axios.get(`${config.API_URL}/report-comments`, {
        withCredentials: true,
      });
      setReports(response.data);
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  const handleDeleteComment = async (commentId, reportId) => {
    try {
      await axios.delete(`${config.API_URL}/comments/${commentId}`, {
        withCredentials: true,
      });
      await axios.put(
        `${config.API_URL}/report-comments/${reportId}/resolve`,
        {},
        { withCredentials: true }
      );
      fetchReports(); // Refresh the reports list after deletion
      toast.success("Xóa bình luận thành công!");
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Xóa bình luận thất bại.");
    }
  };

  const handleDeleteReport = async (reportId) => {
    try {
      await axios.delete(`${config.API_URL}/report-comments/${reportId}`, {
        withCredentials: true,
      });
      fetchReports(); // Refresh the reports list after deletion
      toast.success("Xóa báo cáo thành công!");
    } catch (error) {
      console.error("Error deleting report:", error);
      toast.error("Xóa báo cáo thất bại.");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Quản lý báo cáo Bình Luận</h2>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="px-4 py-2">Người dùng</th>
            <th className="px-4 py-2">Nội dung</th>
            <th className="px-4 py-2">Lý do</th>
            <th className="px-4 py-2">Trạng thái</th>
            <th className="px-4 py-2">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => (
            <tr key={report._id}>
              <td className="border px-4 py-2">{report.user?.username}</td>
              <td className="border px-4 py-2">{report.comment?.comment}</td>
              <td className="border px-4 py-2">{report.reason}</td>
              <td className="border px-4 py-2">
                {report.resolved ? "Đã giải quyết" : "Chưa giải quyết"}
              </td>
              <td className="border px-4 py-2">
                {!report.resolved ? (
                  <button
                    onClick={() =>
                      handleDeleteComment(report.comment?._id, report._id)
                    }
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                  >
                    Xóa Bình Luận
                  </button>
                ) : (
                  <button
                    onClick={() => handleDeleteReport(report._id)}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                  >
                    Xóa Báo Cáo
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <ToastContainer />
    </div>
  );
};

export default ReportCommentManagement;
