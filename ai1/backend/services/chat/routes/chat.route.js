import { Router } from "express";
import {
  chatConversataion,
  getchatConversataion,
  updatechatConversataion,
  deleteConversation,
  saveMessage,
  getMessages,
} from "../controllers/chat.controllers.js";

const router = Router();

// Conversation routes
router.post("/conversations", chatConversataion);
router.get("/conversations", getchatConversataion);
router.put("/conversations/:id", updatechatConversataion);
router.delete("/conversations/:id", deleteConversation);

// Message routes
router.post("/messages", saveMessage);
router.get("/messages/:conversationId", getMessages);

export default router;

