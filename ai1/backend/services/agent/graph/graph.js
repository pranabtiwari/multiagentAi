import { StateGraph, START, END } from "@langchain/langgraph";
import { agentState } from "./state.js";
import { router } from "./routerAgent.js";
import { chatAgent } from "../agents/chat.agent.js";
import { searchAgent } from "../agents/search.agent.js";
import { codingAgent } from "../agents/coding.agent.js";
import { pdfAgent } from "../agents/pdf.agent.js";
import { imageGenAgent } from "../agents/imageGen.agent.js";

const graphWorkFlow = new StateGraph(agentState);

graphWorkFlow.addNode("router", router);
graphWorkFlow.addNode("chat", chatAgent);
graphWorkFlow.addNode("search", searchAgent);
graphWorkFlow.addNode("coding", codingAgent);
graphWorkFlow.addNode("pdf", pdfAgent);
graphWorkFlow.addNode("imageGen", imageGenAgent);

graphWorkFlow.addEdge(START, "router");

graphWorkFlow.addConditionalEdges("router", (state) => {
  switch (state.stateAgentKey) {
    case "chat":
      return "chat";
    case "search":
      return "search";
    case "coding":
      return "coding";
    case "pdf":
      return "pdf";
    case "imageGen":
      return "imageGen";
    default:
      return "chat";
  }
});

graphWorkFlow.addEdge("search", "chat");
graphWorkFlow.addEdge("chat", END);
graphWorkFlow.addEdge("pdf", END);
graphWorkFlow.addEdge("coding", END);
graphWorkFlow.addEdge("imageGen", END);

export const graph = graphWorkFlow.compile();