import "dotenv/config";
import { ChatGroq } from "@langchain/groq";
import { ChatGoogle } from "@langchain/google";
import { ChatOpenRouter } from "@langchain/openrouter";


const grokApiKey = process.env.GROQ_API_KEY;
const geminiApiKey = process.env.GEMINI_KEY;
const openRouterKey = process.env.OPENROUTER_API_KEY

const groq = new ChatGroq({
  apiKey: grokApiKey,
  model: process.env.GROQ_MODEL,
  temperature: 0.2,
  maxRetries: 2,
});

const gemini = new ChatGoogle({
  apiKey: geminiApiKey,
  model: process.env.GEMINI_MODEL,
  temperature: 0.2,
});

const openrouter = new ChatOpenRouter({
  apiKey: openRouterKey,
  model:  process.env.OPENROUTER_MODEL,
  temperature: 0.2,
  maxTokens: 2500,
});

export const getModel = async (agent) => {
  switch (agent) {
    case "chat":
      return groq;
    case "search":
      return gemini;
    case "coding":
      return openrouter;
    case "router":
      return groq;
    default:
      return groq;
  }
};