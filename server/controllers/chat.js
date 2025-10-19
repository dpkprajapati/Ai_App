
import Chat from "../models/chat.js"

// api controller for creating a new chat

export const createChat=async(req,res)=>{
    try{
        const userId = req.user._id

        const chatData= {
            userId,
            messages:[],
            name:"new chat",
            userName: req.user.name
        }

        await Chat.create(chatData)
        res.json ({success:true, message:"chat created"}) 
    }catch(error){
        res.json ({success:false, error:error.message})

    }
}

// Api controller fro getting all chats


export const getChat=async(req,res)=>{
    try{
        const userId = req.user._id
        const chats = await Chat.find({userId}).sort({updatedAt:-1})

       res.json({success:true , chats})
    
    }catch(error){
        res.json ({success:false, error:error.message})

    }
}

// api for deleting chats

export const deleteChat=async(req,res)=>{
    try{
        const userId = req.user._id
        const {chatId} = req.body
        await Chat.deleteOne({_id: chatId, userId})

       res.json({success:true , message:"chat deleted"})
    
    }catch(error){
        res.json ({success:false, error:error.message})

    }
}