import { getModel } from "../config/model.js";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";

const ROUTER_SYSTEM_PROMPT = `You are an expert AI Request Router. Your only job is to analyze the user's prompt and route it to the single most appropriate specialized agent.

Available Agents:
1. "coding": Writing code, programming, scripts, debugging, refactoring, algorithms, SQL/database queries, web development, and terminal commands.
2. "search": Real-time info, live news, weather, recent events, and factual lookups requiring current web search.
3. "imageGen": Requests to generate, draw, render, or create pictures, illustrations, logos, and artwork.
4. "pdf": Requests to read, analyze, summarize, or extract text from PDFs and attached documents.
5. "chat": General conversations, greetings, Q&A, creative writing, advice, and topics not covered by the above.

CRITICAL RULES:
- Output ONLY ONE word matching the exact key: coding, search, imageGen, pdf, or chat.
- Do NOT output any explanation, markdown, punctuation, or extra whitespace.`;

export const router = async (state) => {
  try {
    const llm = await getModel("router");
    const userPrompt = state.prompt || "";

    const response = await llm.invoke([
      new SystemMessage(ROUTER_SYSTEM_PROMPT),
      new HumanMessage(userPrompt),
    ]);

    // Clean up and validate the decision
    let decision = (response.content || "").toString().trim().toLowerCase();

    // Map to valid agent keys
    const validKeys = ["coding", "search", "imagegen", "pdf", "chat"];
    const keyMap = {
      coding: "coding",
      search: "search",
      imagegen: "imageGen",
      pdf: "pdf",
      chat: "chat",
    };

    const selectedKey = keyMap[decision] || "chat";

    return {
      stateAgentKey: selectedKey,
    };
  } catch (error) {
    console.error("Router Agent Error:", error);
    // Fallback to general chat agent if routing fails
    return {
      stateAgentKey: "chat",
    };
  }
};