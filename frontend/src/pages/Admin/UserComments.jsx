import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../../config';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UserComments = ({ userId }) => {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    fetchUserComments();
  }, [userId]);

  const fetchUserComments = async () => {
    try {
      const response = await axios.get(`${config.API_URL}/comments/user/${userId}`);
      if (response.data.status) {
        setComments(response.data.comments);
      } else {
        console.error('Failed to fetch user comments', response.data);
      }
    } catch (err) {
      console.error('Failed to fetch user comments', err);
    }
  };
  const deleteComment = async (commentId) => {
    try {
      await axios.delete(`${config.API_URL}/comments/${commentId}`);
      fetchUserComments(); // Refresh the comments list after deletion
      toast.success('Xóa bình luận thành công!');
    } catch (err) {
      console.error('Failed to delete comment', err);
      toast.error('Xóa bình luận thất bại.');
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
    <h2 className="text-2xl font-bold mb-4">Bình luận của người dùng</h2>
    {comments.length === 0 ? (
      <p className="text-gray-500 italic">Người dùng chưa bình luận phim nào</p>
    ) : (
      <ul className="space-y-4">
        {comments.map((comment) => (
          <li key={comment._id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
            <p className="font-semibold text-lg mb-2">
              <strong>Bộ phim:</strong> {comment.movie ? comment.movie.name : 'N/A'}
            </p>
            <p className="text-gray-700">{comment.comment}</p>
            <button
              onClick={() => deleteComment(comment._id)}
              className="mt-2 bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600"
            >
              Xóa
            </button>
          </li>
        ))}
      </ul>
    )}

    <ToastContainer />
  </div>
  );
};

export default UserComments;
