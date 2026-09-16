import "dotenv/config";
import { ChatGroq } from "@langchain/groq";

const apiKey = process.env.GROQ_API_KEY || process.env.GROK_API_KEY;

const groq = new ChatGroq({
  apiKey,
  model: process.env.GROQ_MODEL ,
  temperature: 0.2,
  maxRetries: 2,
});

export const getModel = async (agent) => {
  switch (agent) {
    case "chat":
      return groq;
    case "search":
      return groq;
    case "coding":
      return groq;
    case "router":
      return groq;
    default:
      return groq;
  }
};