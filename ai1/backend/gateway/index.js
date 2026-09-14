import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser"; 
import proxy from "express-http-proxy";
import { getCurrentUser } from "./controller/user.controller.js";
import { protect } from "../services/auth/middlewares/auth.middleware.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(cookieParser());

app.use("/auth", proxy(process.env.AUTH_URL));
app.get("/me",protect , getCurrentUser);

app.get("/", (req, res) => {
  res.send("Hello Gateway");
});

app.listen(3000, () => {
  console.log("Running");
});
