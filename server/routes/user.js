import express from "express"
import { getPublishedImages, getUser, loginUser, registerUser } from "../controllers/user.js"
import {protect} from "../middlewares/auth.js"


const userRouter = express.Router()


userRouter.post("/register",registerUser)
userRouter.post("/login",loginUser)
userRouter.get("/data",protect ,getUser)  //first checks if user is valid or not
userRouter.get("/published-images", getPublishedImages)

export default userRouter;