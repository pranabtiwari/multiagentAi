import Conversation from "../modles/conversations.model.js";
import Message from "../modles/message.model.js";

// Create a new conversation
export const chatConversataion = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"] || req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: User ID required" });
    }

    const { title } = req.body;
    const conversation = await Conversation.create({
      userId,
      title: title || "New Chat",
    });

    return res.status(201).json({
      message: "Conversation created successfully",
      conversation,
    });
  } catch (error) {
    console.error("Error creating conversation:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      details: error.message,
    });
  }
};

// Get all conversations for the user
export const getchatConversataion = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"] || req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: User ID required" });
    }

    const allConversation = await Conversation.find({ userId }).sort({
      updatedAt: -1,
    });

    return res.status(200).json({
      conversations: allConversation,
      allConversation,
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      details: error.message,
    });
  }
};

// Update conversation title
export const updatechatConversataion = async (req, res) => {
  try {
    const conversationId = req.params.id || req.body.conversationId;
    const { title } = req.body;

    if (!conversationId) {
      return res.status(400).json({ error: "Conversation ID is required" });
    }

    const conversation = await Conversation.findByIdAndUpdate(
      conversationId,
      { title },
      { new: true }
    );

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    return res.status(200).json({
      message: "Conversation updated successfully",
      conversation,
    });
  } catch (error) {
    console.error("Error updating conversation:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      details: error.message,
    });
  }
};

// Delete conversation and associated messages
export const deleteConversation = async (req, res) => {
  try {
    const conversationId = req.params.id || req.body.conversationId;

    if (!conversationId) {
      return res.status(400).json({ error: "Conversation ID is required" });
    }

    await Message.deleteMany({ conversationId });
    const conversation = await Conversation.findByIdAndDelete(conversationId);

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    return res.status(200).json({
      message: "Conversation deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      details: error.message,
    });
  }
};

// Save a new message
export const saveMessage = async (req, res) => {
  try {
    const { conversationId, role, content, artifacts } = req.body;

    if (!conversationId || !role || !content) {
      return res.status(400).json({
        error: "conversationId, role, and content are required",
      });
    }

    const message = await Message.create({
      conversationId,
      role,
      content,
      artifacts: Array.isArray(artifacts) ? artifacts : artifacts ? [artifacts] : [],
    });

    // Touch conversation updatedAt timestamp
    await Conversation.findByIdAndUpdate(conversationId, {
      updatedAt: new Date(),
    });

    return res.status(201).json({
      message: "Message created successfully",
      data: message,
    });
  } catch (error) {
    console.error("Error saving message:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      details: error.message,
    });
  }
};

// Get all messages for a conversation
export const getMessages = async (req, res) => {
  try {
    const conversationId =
      req.params.conversationId || req.query.conversationId || req.body.conversationId;

    if (!conversationId) {
      return res.status(400).json({ error: "conversationId is required" });
    }

    const messages = await Message.find({
      conversationId,
    }).sort({ createdAt: 1 });

    return res.status(200).json({
      messages,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      details: error.message,
    });
  }
};
