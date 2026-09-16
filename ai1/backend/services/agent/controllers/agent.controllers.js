import axios from "axios";
import { graph } from "../graph/graph.js";

export const agent = async (req, res) => {
  try {
    const { prompt, conversationId } = req.body;

    if (!prompt || !conversationId) {
      return res.status(400).json({
        error: "Both 'prompt' and 'conversationId' are required in request body",
      });
    }

    const chatServiceUrl = process.env.CHAT_SERVICE;

    // 1. Save user message to Chat Service
    await axios.post(`${chatServiceUrl}/messages`, {
      conversationId,
      role: "user",
      content: prompt,
    });

    // 2. Invoke LangGraph Multi-Agent Workflow
    const result = await graph.invoke({
      prompt,
      conversationId,
    });

    const aiResponse = result.aiResponse || "";

    // 3. Save assistant response to Chat Service
    if (aiResponse) {
      await axios.post(`${chatServiceUrl}/messages`, {
        conversationId,
        role: "assistant",
        content: aiResponse,
      });
    }

    // 4. Return result to client
    return res.status(200).json({
      message: aiResponse,
      agentUsed: result.stateAgentKey,
    });
  } catch (error) {
    console.error("Agent Controller Error:", error?.response?.data || error.message);
    return res.status(500).json({
      error: "Internal Server Error",
      details: error.message,
    });
  }
};