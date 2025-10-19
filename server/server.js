import express from "express" 
import "dotenv/config"
import cors from "cors"
import connectDB from "./config/db.js";
import userRouter from "./routes/user.js";
import chatRouter from "./routes/chat.js";
import messageRouter from "./routes/msgRoutes.js";
import creditRouter from "./routes/credit.js";
import {stripeWebhook}  from "./controllers/webhook.js";
const app = express();

await connectDB()

// Stripe webhooks
app.post("/api/stripe", express.raw({type: 'application/json'}),stripeWebhook);



// middleware
app.use(cors())
app.use(express.json())


// routes 
app.get("/",(req,res)=>{
    res.send("server is live")
})

app.use("/api/user", userRouter)
app.use("/api/chat", chatRouter)
app.use("/api/message", messageRouter)
app.use("/api/credit", creditRouter)     

const PORT = process.env.PORT || 3000

app.listen(PORT,()=>{
    console.log(`server is running at the port ${PORT}`)
})