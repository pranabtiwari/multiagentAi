import instance from "../../utils/axios.js";

// 1. Create a new conversation
export const createConversation = async (title = "New Chat") => {
  try {
    const safeTitle =
      typeof title === "string" && title.trim().length > 0
        ? title.trim()
        : "New Chat";

    const response = await instance.post("/chat/conversations", {
      title: safeTitle,
    });
    return response.data?.conversation || response.data;
  } catch (error) {
    console.error(
      "Error creating conversation:",
      error?.response?.data || error.message
    );
    throw error;
  }
};
export const createConversations = createConversation;

// 2. Get all conversations for current user
export const getchatConversataion = async () => {
  try {
    const response = await instance.get("/chat/conversations");
    return (
      response.data?.conversations ||
      response.data?.allConversation ||
      []
    );
  } catch (error) {
    if (error?.response?.status === 401) {
      return [];
    }
    console.error(
      "Error fetching conversations:",
      error?.response?.data || error.message
    );
    return [];
  }
};
export const getConversations = getchatConversataion;

// 3. Update conversation title
export const updatechatConversataion = async (id, title) => {
  try {
    const safeTitle =
      typeof title === "string" && title.trim().length > 0
        ? title.trim()
        : "Untitled Chat";

    const response = await instance.put(`/chat/conversations/${id}`, {
      title: safeTitle,
    });
    return response.data?.conversation || response.data;
  } catch (error) {
    console.error(
      "Error updating conversation:",
      error?.response?.data || error.message
    );
    throw error;
  }
};
export const updateConversation = updatechatConversataion;

// 4. Delete conversation
export const deleteConversation = async (id) => {
  try {
    const response = await instance.delete(`/chat/conversations/${id}`);
    return response.data;
  } catch (error) {
    console.error(
      "Error deleting conversation:",
      error?.response?.data || error.message
    );
    throw error;
  }
};

// 5. Get all messages for a specific conversation
export const getMessages = async (conversationId) => {
  try {
    const response = await instance.get(`/chat/messages/${conversationId}`);
    return response.data?.messages || [];
  } catch (error) {
    console.error(
      "Error fetching messages:",
      error?.response?.data || error.message
    );
    return [];
  }
};

// 6. Save a message
export const saveMessage = async (conversationId, role, content) => {
  try {
    const response = await instance.post("/chat/messages", {
      conversationId,
      role,
      content,
    });
    return response.data?.data || response.data;
  } catch (error) {
    console.error(
      "Error saving message:",
      error?.response?.data || error.message
    );
    throw error;
  }
};

// 7. Send message to AI Agent workflow
export const sendMessageToAgent = async (prompt, conversationId) => {
  try {
    const response = await instance.post("/agent/chat", {
      prompt,
      conversationId,
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error sending message to agent:",
      error?.response?.data || error.message
    );
    throw error;
  }
};