import redisClient from "../../../shared/redis.js";
import { getMessages } from "../utils/getMessages.js";

// Helper to construct consistent Redis cache key
const getMemoryKey = (conversationId) => `conversation:${conversationId}:messages`;

// Get conversation messages (checks Redis cache first, falls back to Chat Service database)
export const getMemoryConversation = async (conversationId) => {
  if (!conversationId) return [];
  const key = getMemoryKey(conversationId);

  try {
    const cached = await redisClient.get(key);
    if (cached) {
      return JSON.parse(cached);
    }

    // Fallback: Fetch history from Chat Service database
    const messages = await getMessages(conversationId);
    if (Array.isArray(messages) && messages.length > 0) {
      await redisClient.set(key, JSON.stringify(messages), "EX", 24 * 60 * 60);
    }
    return messages;
  } catch (error) {
    console.error("Error retrieving conversation memory:", error);
    return [];
  }
};

// Add a message to Redis sliding-window memory
export const addMemoryConversation = async (conversationId, role, content) => {
  if (!conversationId || !role || !content) return;
  const key = getMemoryKey(conversationId);

  try {
    const rawMessages = await redisClient.get(key);
    const messages = rawMessages ? JSON.parse(rawMessages) : [];

    messages.push({ role, content });

    // Keep sliding memory window to 10 messages
    if (messages.length > 10) {
      messages.shift();
    }

    await redisClient.set(key, JSON.stringify(messages), "EX", 24 * 60 * 60);
    return messages;
  } catch (error) {
    console.error("Error adding message to memory:", error);
  }
};

// Alias exports for backward compatibility
export const getmemoryConverstation = getMemoryConversation;