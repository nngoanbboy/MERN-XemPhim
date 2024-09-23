import React, { useState, useEffect } from "react";
import axios from "axios";
import config from "../../config";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UserComments from "./UserComments";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [banDurations, setBanDurations] = useState({});
  const [userToDelete, setUserToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser, setCurrentUser] = useState({});

  useEffect(() => {
    fetchUsers();
    checkLoginStatus();
  }, []);
  const checkLoginStatus = async () => {
    try {
      const response = await axios.get(`${config.API_URL}/users/profile`);
      console.log(response.data);
      setCurrentUser(response.data.user);
    } catch (err) {
      console.error("Failed to fetch user status", err);
    }
  };
  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${config.API_URL}/users`);
      if (Array.isArray(response.data.users)) {
        setUsers(response.data.users);

        // Initialize banDurations state with existing values
        const initialBanDurations = response.data.users.reduce((acc, user) => {
          acc[user._id] = 1; // Default ban duration
          return acc;
        }, {});
        setBanDurations(initialBanDurations);
      } else {
        console.error("Unexpected response format:", response.data);
      }
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  const confirmDeleteUser = (id) => {
    setUserToDelete(id);
  };

  const deleteUser = async () => {
    if (!userToDelete) return;

    try {
      await axios.delete(`${config.API_URL}/users/${userToDelete}`);
      fetchUsers(); // Refresh the user list after deletion
      toast.success("Xóa Người Dùng thành công!");
    } catch (err) {
      console.error("Failed to delete user", err);
      toast.error("Xóa Người Dùng thất bại.");
    } finally {
      setUserToDelete(null);
    }
  };

  const toggleAdminStatus = async (id, currentStatus) => {
    try {
      await axios.patch(`${config.API_URL}/users/${id}`, {
        isAdmin: !currentStatus,
      });
      fetchUsers();
      toast.success("Duyệt Role Thành Công!");
    } catch (err) {
      console.error("Failed to update user status", err);
      toast.error("Duyệt Role thất bại!.");
    }
  };

  const banUser = async (id) => {
    try {
      await axios.post(`${config.API_URL}/users/ban/${id}`, {
        banDuration: banDurations[id],
      });
      fetchUsers();
      toast.success("Cấm người dùng thành công!");
    } catch (err) {
      console.error("Failed to ban user", err);
      toast.error("Cấm người dùng thất bại.");
    }
  };

  const unbanUser = async (id) => {
    try {
      await axios.post(`${config.API_URL}/users/unban/${id}`);
      fetchUsers();
      toast.success("Bỏ cấm người dùng thành công!");
    } catch (err) {
      console.error("Failed to unban user", err);
      toast.error("Bỏ cấm người dùng thất bại.");
    }
  };

  const handleBanDurationChange = (id, value) => {
    setBanDurations((prev) => ({
      ...prev,
      [id]: value,
    }));
  };
  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Quản lý tài khoản</h2>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên người dùng"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border rounded w-1/4"
        />
      </div>

      <table className="min-w-full">
        <thead>
          <tr>
            <th className="px-4 py-2">Tên người dùng</th>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Vai trò</th>
            <th className="px-4 py-2">Xác thực Email</th>
            <th className="px-4 py-2">Hành động</th>
            <th className="px-4 py-2">Cấm người dùng</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user._id}>
              <td className="border px-4 py-2">
                <button
                  onClick={() => setSelectedUserId(user._id)}
                  className="text-blue-500 underline"
                >
                  {user.username}
                </button>
              </td>
              <td className="border px-4 py-2">{user.email}</td>
              <td className="border px-4 py-2">
                {user.isAdmin ? "Admin" : "User"}
              </td>
              <td className="border px-4 py-2">
                {user.isVerified ? "Đã xác thực" : "Chưa xác thực"}
              </td>
              <td className="border px-4 py-2">
                {currentUser.email === "luonghuy.lsn@gmail.com" &&
                  user.email !== "luonghuy.lsn@gmail.com" && (
                    <>
                      <button
                        onClick={() =>
                          toggleAdminStatus(user._id, user.isAdmin)
                        }
                        className="bg-yellow-500 text-white p-1 rounded mr-2"
                      >
                        {user.isAdmin ? "Hủy quyền Admin" : "Cấp quyền Admin"}
                      </button>
                      <button
                        onClick={() => confirmDeleteUser(user._id)}
                        className="bg-red-500 text-white p-1 rounded"
                      >
                        Xóa
                      </button>
                    </>
                  )}
              </td>
              <td className="border px-4 py-2">
                {user.email !== "luonghuy.lsn@gmail.com" &&
                  user._id !== currentUser._id &&
                  (user.isBanned ? (
                    <button
                      onClick={() => unbanUser(user._id)}
                      className="bg-green-500 text-white p-1 rounded ml-2"
                    >
                      Bỏ cấm
                    </button>
                  ) : (
                    <>
                      <input
                        type="number"
                        value={banDurations[user._id] || 1}
                        onChange={(e) =>
                          handleBanDurationChange(user._id, e.target.value)
                        }
                        className="w-16 mr-2"
                      />
                      <button
                        onClick={() => banUser(user._id)}
                        className="bg-orange-500 text-white p-1 rounded ml-2"
                      >
                        Cấm (giờ)
                      </button>
                    </>
                  ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {selectedUserId && <UserComments userId={selectedUserId} />}
      {userToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-5 rounded-lg">
            <p>Bạn có chắc chắn muốn xóa người dùng này?</p>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setUserToDelete(null)}
                className="bg-gray-300 text-black p-2 rounded mr-2"
              >
                Hủy
              </button>
              <button
                onClick={deleteUser}
                className="bg-red-500 text-white p-2 rounded"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default UserManagement;
