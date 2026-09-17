import axios from "axios";

export const getMessages = async (conversationId) => {
  try {
    const chatServiceUrl = process.env.CHAT_SERVICE || "http://localhost:3002";
    const { data } = await axios.get(
      `${chatServiceUrl}/messages/${conversationId}`
    );
    return data.messages || [];
  } catch (error) {
    console.error(
      "Error fetching messages in agent service:",
      error?.response?.data || error.message
    );
    return [];
  }
};

// Export alias for backward compatibility
export const getMeassages = getMessages;