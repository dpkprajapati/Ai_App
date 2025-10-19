import express from "express"
import {protect} from "../middlewares/auth.js"
import { textMSGController , imageMSGController} from "../controllers/messageController.js"

const messageRouter= express.Router()

messageRouter.post("/text", protect , textMSGController)
messageRouter.post("/image", protect , imageMSGController)

export default messageRouter