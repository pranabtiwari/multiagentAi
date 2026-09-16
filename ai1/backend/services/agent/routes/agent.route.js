import { agent } from "../controllers/agent.controllers.js"
import { Router } from "express";

const route = Router()

route.post("/chat", agent)

export default route