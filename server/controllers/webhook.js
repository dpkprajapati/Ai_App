import Stripe from "stripe";
import Transaction from "../models/transaction.js";
import User from "../models/user.js";

export const stripeWebhook = async (req, res) => {
  console.log("========== WEBHOOK CALLED ==========");
  
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body, 
      sig, 
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log("✓ Signature verified. Event type:", event.type);
  } catch (error) {
    console.log("ERROR: Signature verification failed:", error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log("Session metadata:", session.metadata);
        
        const { transactionId, appId } = session.metadata;

        if (!transactionId) {
          console.log("ERROR: No transactionId in metadata");
          return res.json({ received: true, message: "No transactionId" });
        }

        if (appId !== 'quickgpt') {
          console.log("Ignoring event: appId is", appId);
          return res.json({ received: true, message: "Invalid appId" });
        }

        console.log("Looking for transaction:", transactionId);
        const transaction = await Transaction.findById(transactionId);

        if (!transaction) {
          console.log("ERROR: Transaction not found:", transactionId);
          return res.json({ received: true, message: "Transaction not found" });
        }

        console.log("Transaction found. isPaid:", transaction.isPaid);

        if (transaction.isPaid) {
          console.log("Transaction already processed");
          return res.json({ received: true, message: "Already processed" });
        }

        // Update credits in user account
        console.log("Updating credits for user:", transaction.userId);
        await User.updateOne(
          { _id: transaction.userId },
          { $inc: { credits: transaction.credits } }
        );

        // Mark transaction as paid
        transaction.isPaid = true;
        await transaction.save();

        console.log("✓ Payment processed successfully!");
        break;
      }

      default:
        console.log("Unhandled event type:", event.type);
        break;
    }

    res.json({ received: true });
  } catch (error) {
    console.log("ERROR processing webhook:", error.message);
    res.status(500).send(`Server Error: ${error.message}`);
  }
};
