import Stripe from "stripe";
import Transaction from "../models/transaction.js";
import User from "../models/user.js";

export const stripeWebhook =  async (req, res) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const sig = req.headers['stripe-signature'];
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    
    }catch (error) { 
        return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    try {
        switch (event.type) {
            case 'payment_intent.succeeded': {
                const paymentIntent = event.data.object;
                const sessionList = await stripe.checkout.sessions.list({
                    payment_intent:paymentIntent.id,
                });
                const session = sessionList.data[0];
                const {transactionId, appId} = session.metadata;

                if(appId === 'quickgpt'){
                    const transaction = await Transaction.findById({_id: transactionId, isPaid:false});


                    // update credits in user account
                    await User.updateOne({_id: transaction.userId}, {$inc: {credits: transaction.credits}});

                    // update credits in user account
                    transaction.isPaid = true;
                    await transaction.save();
                }else{
                    return response.json({received: true, message:"Ignored event:invalid app id" });
                }
                break;
            }

        default:
            console.log(`Unhandled event type: ${event.type}`);
            break;
        }
        response.json({received: true });
    }catch (error) {
        console.log("webhook processing error:",error.message);
        res.status(500).send(`Server Error: ${error.message}`);
    } 
}   