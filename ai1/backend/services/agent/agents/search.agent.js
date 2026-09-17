import { getModel } from "../config/model.js";
import { SystemMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import {
  getMemoryConversation,
  addMemoryConversation,
} from "../config/memory.js";

const SEARCH_SYSTEM_PROMPT = `You are freeAi's dedicated Web Search & Information Retrieval Specialist.

## Core Role & Scope
- Your ONLY focus is web research, real-time factual lookups, current news, technical documentation lookups, and data verification.
- You are NOT a general conversational chatbot, code generator, or creative writer. Defer general conversation to the Chat Agent and code writing to the Coding Agent.

## Search & Research Mandate
1. **Factual Integrity & Recency**:
   - Provide up-to-date, real-world, and empirically verifiable facts.
   - Always assume time-sensitive topics (news, releases, statistics, stock prices, API changes, events) require fresh, verified data.
   - Never invent or fabricate URLs, sources, citations, statistics, or quotes.

2. **Synthesis & Citation**:
   - Structure responses with clear headings, concise bullet points, and data tables.
   - For every key factual assertion, cite the source or publication context clearly (e.g. \`[Source: Official Docs, 2026]\`).
   - Clearly distinguish between verified facts vs. claims or opinions.

3. **Output Format**:
   - Give a direct, structured summary of your research findings immediately.
   - Do NOT include filler intros like "Sure, I searched the web for you!".
   - If a fact cannot be verified, state: *"This claim could not be verified with current sources."*`;

export const searchAgent = async (state) => {
  try {
    const userPrompt = state.prompt;
    const conversationId = state.conversationId;
    const llm = await getModel("search");

    // 1. Fetch conversation context from Redis memory
    const history = await getMemoryConversation(conversationId);

    const messages = [new SystemMessage(SEARCH_SYSTEM_PROMPT)];

    if (Array.isArray(history)) {
      history.forEach((msg) => {
        if (msg.role === "user") {
          messages.push(new HumanMessage(msg.content));
        } else if (msg.role === "assistant") {
          messages.push(new AIMessage(msg.content));
        }
      });
    }

    // 2. Append current user prompt
    const lastMsg = history[history.length - 1];
    if (!lastMsg || lastMsg.content !== userPrompt) {
      messages.push(new HumanMessage(userPrompt));
    }

    // 3. Invoke Gemini model
    const response = await llm.invoke(messages);
    const aiResponse = response.content;

    // Optional structured search metadata/citations extracted from response
    const searchResults = response.response_metadata?.groundingMetadata || [];

    // 4. Save to Redis sliding memory
    if (conversationId) {
      await addMemoryConversation(conversationId, "user", userPrompt);
      await addMemoryConversation(conversationId, "assistant", aiResponse);
    }

    return {
      aiResponse,
      stateAgentKey: "search",
      searchResults,
    };
  } catch (error) {
    console.error("Search Agent Error:", error?.response?.data || error.message || error);
    return {
      aiResponse: `Search Agent Error: ${error.message || "Failed to search"}`,
      stateAgentKey: "search",
      searchResults: [],
    };
  }
};