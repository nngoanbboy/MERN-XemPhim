import React, { useState, useEffect } from "react";
import axios from "axios";
import config from "../../config";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ReportManagement = () => {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await axios.get(`${config.API_URL}/reports`);
      setReports(response.data);
      console.log("API URL:", `${config.API_URL}/reports`); // Thêm log để kiểm tra URL
      console.log("Dữ liệu báo cáo:", response.data);
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  const handleResolveReport = async (reportId) => {
    try {
      await axios.put(`${config.API_URL}/reports/${reportId}/resolve`);
      fetchReports(); // Refresh the list
      toast.success("Xử lý báo cáo thành công");
    } catch (error) {
      console.error("Error resolving report:", error);
    }
  };
  const handleDeleteReport = async (reportId) => {
    try {
      await axios.delete(`${config.API_URL}/reports/${reportId}`);
      fetchReports();
      toast.success("Xóa báo cáo thành công");
    } catch (error) {
      console.error("Error deleting report:", error);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Quản lý báo lỗi tập phim</h2>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Phim</th>
            <th className="py-2 px-4 border-b">Tập</th>
            <th className="py-2 px-4 border-b">Mô tả lỗi</th>
            <th className="py-2 px-4 border-b">Trạng thái</th>
            <th className="py-2 px-4 border-b">Hành động</th>
            <th className="py-2 px-4 border-b">Link đến tập phim</th>{" "}
            {/* Thêm tiêu đề cột mới */}
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => (
            <tr key={report._id}>
              <td className="py-2 px-4 border-b">{report.movie.name}</td>
              <td className="py-2 px-4 border-b">{report.episode}</td>
              <td className="py-2 px-4 border-b">{report.description}</td>
              <td className="py-2 px-4 border-b">
                {report.resolved ? "Đã xử lý" : "Chưa xử lý"}
              </td>
              <td className="py-2 px-4 border-b">
                {report.resolved ? (
                  <button
                    onClick={() => handleDeleteReport(report._id)}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                  >
                    Xóa
                  </button>
                ) : (
                  <button
                    onClick={() => handleResolveReport(report._id)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
                  >
                    Đánh dấu đã xử lý
                  </button>
                )}
              </td>
              <td className="py-2 px-4 border-b">
                <a
                  href={`/xem-phim/${report.movie.slug}/tap-${report.episode}`}
                  className="text-blue-500 underline"
                >
                  Xem tập phim
                </a>
              </td>{" "}
              {/* Thêm dữ liệu cho cột mới */}
            </tr>
          ))}
        </tbody>
      </table>
      <ToastContainer />
    </div>
  );
};

export default ReportManagement;
