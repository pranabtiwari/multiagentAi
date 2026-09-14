import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";
import route from "./routes/auth.route.js";


dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/", route);

app.get("/", (req, res) => {
    res.send("Hello Auth Service");
});

app.listen(process.env.port, () => {
  console.log("Running");
  connectDB();
});
