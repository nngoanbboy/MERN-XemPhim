// src/components/Spinner.jsx
import React from 'react';

const Spinner = () => {
  return (
    <div className="spinner-container">
      <div className="spinner"></div>
      <style  jsx="true">{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spinner-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background-color: rgba(0, 0, 0, 0.8);
        }
        .spinner {
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top: 4px solid #ffffff;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Spinner;