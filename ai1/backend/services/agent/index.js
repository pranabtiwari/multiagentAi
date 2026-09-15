import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";

dotenv.config();

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello Agent Service");
});

const PORT = process.env.port;

app.listen(PORT, () => {
  console.log(`Agent service running on port ${PORT}`);
  connectDB();
});
