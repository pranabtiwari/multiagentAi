import {Router}  from "express"
import { login, logout } from "../controllers/auth.controller.js"

const route = Router()

route.post("/login", login)
route.post("/logout", logout)

export default route