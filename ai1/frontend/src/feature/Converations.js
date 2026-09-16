import instance from "../../utils/axios.js";

// 1. Create a new conversation
export const createConversation = async (title = "New Chat") => {
  try {
    const { data } = await instance.post("/chat/conversations", { title });
    return data.conversation || data;
  } catch (error) {
    console.error("Error creating conversation:", error);
    throw error;
  }
};
export const createConversations = createConversation;

// 2. Get all conversations for current user
export const getchatConversataion = async () => {
  try {
    const { data } = await instance.get("/chat/conversations");
    return data.conversations || data.allConversation || [];
  } catch (error) {
    console.error("Error fetching conversations:", error);
    throw error;
  }
};
export const getConversations = getchatConversataion;

// 3. Update conversation title
export const updatechatConversataion = async (id, title) => {
  try {
    const { data } = await instance.put(`/chat/conversations/${id}`, { title });
    return data.conversation || data;
  } catch (error) {
    console.error("Error updating conversation:", error);
    throw error;
  }
};
export const updateConversation = updatechatConversataion;

// 4. Delete conversation
export const deleteConversation = async (id) => {
  try {
    const { data } = await instance.delete(`/chat/conversations/${id}`);
    return data;
  } catch (error) {
    console.error("Error deleting conversation:", error);
    throw error;
  }
};

// 5. Get all messages for a specific conversation
export const getMessages = async (conversationId) => {
  try {
    const { data } = await instance.get(`/chat/messages/${conversationId}`);
    return data.messages || [];
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
};

// 6. Save a message
export const saveMessage = async (conversationId, role, content) => {
  try {
    const { data } = await instance.post("/chat/messages", {
      conversationId,
      role,
      content,
    });
    return data.data || data;
  } catch (error) {
    console.error("Error saving message:", error);
    throw error;
  }
};

// 7. Send message to AI Agent workflow
export const sendMessageToAgent = async (prompt, conversationId) => {
  try {
    const { data } = await instance.post("/agent/chat", {
      prompt,
      conversationId,
    });
    return data;
  } catch (error) {
    console.error("Error sending message to agent:", error);
    throw error;
  }
};