import "dotenv/config";
import express from "express";
import { connectDB } from "./config/db.js";
import route from "./routes/agent.route.js";

const app = express();

app.use(express.json());

app.use("/", route);
app.get("/", (req, res) => {
  res.send("Hello Agent Service");
});

const PORT = process.env.PORT || process.env.port || 3003;

app.listen(PORT, () => {
  console.log(`Agent service running on port ${PORT}`);
  connectDB();
});
