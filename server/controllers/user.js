import User from "../models/user.js";
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import Chat from "../models/chat.js";

// generate JWT by user_data, secret_key and set expiry
const generateToken = (id)=>{
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn:"30d"
    }
    )
}

// Api to register user
export const registerUser = async(req,res)=>{
    const {name, email, password} = req.body;

    try{
        const userExist = await User.findOne({email})
        if(userExist){
            return res.json({success:false, message:"user already exists"})
        }
        const user = await User.create({name, email, password})

        // the generated_token saved by token variable
        const token = generateToken(user._id)

        res.json({success:true, token})
    }catch(error){
        return res.json({success:false, message:error.message})
    }
}

// Api to login user 
export const loginUser = async (req,res)=>{
    const { email, password} = req.body;
    try{
        const user = await User.findOne({email})
        if(user){
            const isMatch = await bcrypt.compare(password, user.password)   //checks password entered by the user and in database

            if(isMatch){
                const token = generateToken(user._id)   //if matches then token unique token is returned
                return res.json({success:true, token})
            }
        }

        return res.json ({success:false, message : "invalid email or password"})

    }catch(error){
        return res.json({success:false, message:error.message})
    }
}


// Api to get user data 
export const getUser = async (req,res)=>{
    try{
        const user =req.user;
        return res.json({success:true,  user})

    }catch(error){
    return res.json({success:false, message:error.message})
    }
}

export const getPublishedImages= async (req,res)=>{
    try{
        const publishedImageMessages = await Chat.aggregate([
            { $unwind: "$messages" },
            { $match: { "messages.isPublished": true, "messages.isImage": true } },
            { $project: { _id: 0, imageUrl: "$messages.content",userName:"$userName" } },
        ])

        res.json({success:true, images : publishedImageMessages.reverse()})
    }catch(error){
        return res.json({success:false, message:error.message})
    }
}