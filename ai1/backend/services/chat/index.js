import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import chatRoutes from "./routes/chat.route.js";

dotenv.config();

const app = express();

app.use(express.json());

// Chat and Conversation Routes
app.use("/", chatRoutes);

app.get("/", (req, res) => {
  res.send("Hello Chat Service");
});

const PORT = process.env.port || process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`Chat service running on port ${PORT}`);
  connectDB();
});
