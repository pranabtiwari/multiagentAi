import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import proxy from "express-http-proxy";
import { getCurrentUser } from "./controller/user.controller.js";
import { protect } from "../services/auth/middlewares/auth.middleware.js";
import { proxyHeaders } from "./utils/proxyHeaders.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(cookieParser());

// Public Auth Service proxy
app.use("/auth", proxy(process.env.AUTH_URL));

// Protected Chat Service proxy (attaches x-user-id header)
app.use("/chat", protect, proxyHeaders(process.env.CHAT_URL));
app.use("/agent", protect, proxy(process.env.AGENT_URL))
// Current user profile
app.get("/me", protect, getCurrentUser);

app.get("/", (req, res) => {
  res.send("Hello Gateway");
});

app.listen(3000, () => {
  console.log("Gateway Running on port 3000");
});
