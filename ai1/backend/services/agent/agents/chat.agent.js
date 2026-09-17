import { getModel } from "../config/model.js";
import { SystemMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import {
  getMemoryConversation,
  addMemoryConversation,
} from "../config/memory.js";

const CHAT_SYSTEM_PROMPT = `You are freeAi, an intelligent, helpful, and friendly AI assistant.
- Provide clear, accurate, and insightful responses.
- Use markdown formatting (headings, bullet points, bold text, code blocks) to make answers structured and readable.
- Be polite, concise, and helpful.`;

export const chatAgent = async (state) => {
  try {
    const llm = await getModel("chat");
    const userPrompt = state.prompt;
    const conversationId = state.conversationId;

    // Retrieve previous messages from Redis memory
    const history = await getMemoryConversation(conversationId);

    // Build LangChain prompt with history context
    const messages = [new SystemMessage(CHAT_SYSTEM_PROMPT)];

    if (Array.isArray(history)) {
      history.forEach((msg) => {
        if (msg.role === "user") {
          messages.push(new HumanMessage(msg.content));
        } else if (msg.role === "assistant") {
          messages.push(new AIMessage(msg.content));
        }
      });
    }

    // Append current prompt if not already in history
    const lastMsg = history[history.length - 1];
    if (!lastMsg || lastMsg.content !== userPrompt) {
      messages.push(new HumanMessage(userPrompt));
    }

    const response = await llm.invoke(messages);
    const aiResponse = response.content;

    // Save messages to Redis sliding window memory
    await addMemoryConversation(conversationId, "user", userPrompt);
    await addMemoryConversation(conversationId, "assistant", aiResponse);

    return {
      aiResponse,
    };
  } catch (error) {
    console.error("Chat Agent Error:", error);
    return {
      aiResponse: "I encountered an error while generating a response. Please try again.",
    };
  }
};