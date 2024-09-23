import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import config from "../../config";

export const FavoriteContext = createContext();
//Context để quản lý Phim yêu thích dùng để chia sẻ trạng thái và các phương thức quản lý phim yêu thích.
export const FavoriteProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const response = await axios.get(`${config.API_URL}/movies/favorites`, {
        withCredentials: true,
      });
      setFavorites(response.data.favorites);
    } catch (error) {
      console.error("Failed to fetch favorites:", error);
    }
  };

  const toggleFavorite = async (movieId) => {
    try {
      await axios.post(
        `${config.API_URL}/movies/favorite/${movieId}`,
        {},
        {
          withCredentials: true,
        }
      );
      // Update the favorite list
      await fetchFavorites();
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    }
  };
  const clearFavorites = () => setFavorites([]);

  return (
    <FavoriteContext.Provider
      value={{ favorites, setFavorites, toggleFavorite, clearFavorites }}
    >
      {children}
    </FavoriteContext.Provider>
  );
};
