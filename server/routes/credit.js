import express from "express"
import {protect} from "../middlewares/auth.js"
import {getPlans,purchasePlan} from "../controllers/credit.js"

const creditRouter = express.Router()


creditRouter.get("/plans", getPlans)
creditRouter.post("/purchase",protect,purchasePlan)

export default creditRouter