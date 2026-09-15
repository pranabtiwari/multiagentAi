// src/feature/getCurrentUser.js
import instance from "../../utils/axios";

export const getCurrentUser = async () => {
  try {
    const response = await instance.get("/me");
    return response.data;
  } catch (error) {
    // 401 is normal for visitors who are not logged in yet
    if (error.response?.status === 401) {
      return null;
    }
    console.error("Error fetching current user:", error);
    return null;
  }
};