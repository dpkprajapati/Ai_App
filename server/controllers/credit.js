import Transaction from "../models/transaction.js"
import Stripe from "stripe"

const plans= [
    {
        _id: "basic",
        name: "Basic",
        price: 1,
        credits: 100,
        features: ['100 text generations', '50 image generations', 'Standard support', 'Access to basic models']
    },
    {
        _id: "pro",
        name: "Pro",
        price: 5,
        credits: 500,
        features: ['500 text generations', '200 image generations', 'Priority support', 'Access to pro models', 'Faster response time']
    },
    {
        _id: "premium",
        name: "Premium",
        price: 10,
        credits: 1000,
        features: ['1000 text generations', '500 image generations', '24/7 VIP support', 'Access to premium models', 'Dedicated account manager']
    }
]

// api controller to get all plans
export const getPlans= async (req,res)=>{
    try {
        res.json({success:true, plans   }) 
    } catch (error) {
        res.json({success:false, message:error.message})
    }
}

const stripe= new Stripe(process.env.STRIPE_SECRET_KEY)

// api controller for purchasing a plan
export const purchasePlan= async (req,res)=>{
    try {       
        const { planId }= req.body
        const userId= req.user._id
        const plan= plans.find(p=> p._id === planId)
        if(!plan){
            return res.json({success:false, message:"Invalid plan ID"})
        }
                   
        
        const transaction= await Transaction.create({
            userId: userId,
            planId: plan._id,
            amount: plan.price,
            credits: plan.credits,
            isPaid: false
        })
        const origin = process.env.CLIENT_URL || req.headers.origin || "http://localhost:5173";
        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        unit_amount: plan.price * 100,
                        product_data: {
                            name: plan.name,  
                        },
                    
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${origin}/loading`,
            cancel_url: `${origin}/plans`,
            metadata: {transactionId: transaction._id.toString(),appId: 'quickgpt'},
            expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes from now
        });

        res.json({success:true, url: session.url})

    }catch(error){
        res.json({success:false, message:error.message})
    }           
}

