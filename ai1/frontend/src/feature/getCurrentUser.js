import instance from "../../utils/axios";

export const getCurrentUser = async () => {
  try {
    const response = await instance.get("/me");
    return response.data;
  } catch (error) {
    console.error("Error fetching current user:", error);
    throw error;
  }
};
