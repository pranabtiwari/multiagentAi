import "dotenv/config";
import { ChatGroq } from "@langchain/groq";
import { ChatGoogle } from "@langchain/google";

const grokApiKey = process.env.GROQ_API_KEY;
const geminiApiKey = process.env.GEMINI_KEY || process.env.GEMINI_API_KEY;

const groq = new ChatGroq({
  apiKey: grokApiKey,
  model: process.env.GROQ_MODEL || "llama3-8b-8192",
  temperature: 0.2,
  maxRetries: 2,
});

const gemini = new ChatGoogle({
  apiKey: geminiApiKey,
  model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
  temperature: 0.2,
});

export const getModel = async (agent) => {
  switch (agent) {
    case "chat":
      return groq;
    case "search":
      return gemini;
    case "coding":
      return groq;
    case "router":
      return groq;
    default:
      return groq;
  }
};