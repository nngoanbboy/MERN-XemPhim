// ScrollToTopButton.jsx
import React, { useState, useEffect } from "react";

const ScrollToTopButton = () => {
  const [visible, setVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-10 right-10 p-4 right-1 rounded-full bg-blue-500 text-white shadow-lg transition-opacity ${
        visible ? "opacity-100" : "opacity-0"
      } flex items-center justify-center`}
      style={{ display: visible ? "block" : "none" }}
    >
      <span className="text-3xl font-bold">↑</span>
    </button>
  );
};

export default ScrollToTopButton;
