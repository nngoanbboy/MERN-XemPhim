import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import config from "../../config";
import { useNavigate } from "react-router-dom";

//Xác minh Email
const VerifyEmail = () => {
  const { token } = useParams();
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      //Lấy dữ liệu từ backend
      try {
        const response = await axios.get(
          `${config.API_URL}/users/verify-email/${token}`
        );
        setMessage(response.data.msg);
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } catch (error) {
        setMessage("Email verification failed.");
      }
    };

    verifyEmail();
  }, [token]);

  return (
    //Thông báo
    <div className="verification-page">
      <h1>{message}</h1>
    </div>
  );
};

export default VerifyEmail;
