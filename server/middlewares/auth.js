import jwt from "jsonwebtoken"
import User from "../models/user.js"


// This is a middleware function that protects routes
// It checks if the user has a valid token before allowing access to protected routes
export const protect = async(req, res , next)=>{
    // get the token here from request headers
    let token = req.headers.authorization;

    try{
        // Verify the token is real and not expired using the token and secret password
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        //  Extract the user ID from the decoded token
        // When we created the token during login, we stored the user ID inside it as payload
        // Now we're getting that ID back
        const userId = decoded.id;

         // Find the user in the database using the ID from the token
        // This ensures the user still exists in our system
        const user = await User.findById(userId)

        // checks for user is exists in database or token has invalid user_id
        if(!user){
            return res.json({success:false , message:"not authorized , user not found"})
        }


        //stores data of user if its found
        req.user = user;
        next()

    }catch(err){
        res.status(401).json({message:"not authorized , token failed"})
    }

}