import { getModel } from "../config/model.js";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";

const CHAT_SYSTEM_PROMPT = `You are freeAi, an intelligent, helpful, and friendly AI assistant.
- Provide clear, accurate, and insightful responses.
- Use markdown formatting (headings, bullet points, bold text, code blocks) to make answers structured and readable.
- Be polite, concise, and helpful.`;

export const chatAgent = async (state) => {
  try {
    const llm = await getModel("chat");
    const userPrompt = state.prompt;

    const response = await llm.invoke([
      new SystemMessage(CHAT_SYSTEM_PROMPT),
      new HumanMessage(userPrompt),
    ]);

    return {
      aiResponse: response.content,
    };
  } catch (error) {
    console.error("Chat Agent Error:", error);
    return {
      aiResponse: "I encountered an error while generating a response. Please try again.",
    };
  }
};