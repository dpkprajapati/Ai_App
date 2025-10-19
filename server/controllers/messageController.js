import imagekit from "../config/imagekit.js"
import Chat from "../models/chat.js"
import User from "../models/user.js"
import openai  from "../config/openai.js"
import axios from "axios"

//text-based  Ai chat message controller

export const textMSGController= async(req, res)=>{
    try{
        const userId = req.user._id
        // check credits
        if(req.user.credits < 2){
            return res.json({success:false, message:"not enough credits to use this feature"})
        }

        const {chatId, prompt} = req.body

        const chat = await Chat.findOne({userId, _id:chatId})
        chat.messages.push({role:"user", content:prompt, timestamp:Date.now(),
        isImage:false})

        const {choices} = await openai.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                {
                    role: "user",
                    content: prompt
                },
            ],
        });
        
        const reply = {...choices[0].message, timestamp: Date.now(), isImage: false}
        res.json({succes: true, reply})
        chat.messages.push(reply)

        await chat.save() 

        await User.updateOne({_id : userId}, {$inc: {credits: -1}})

       
    }catch(error){
        res.json({success: false, message:error.message})
    }
}

// image genration message controller
export const imageMSGController= async(req, res)=>{
    try{
        const userId = req.user._id
        // check credits
        if(req.user.credits < 2){
            return res.json({success:false, message:"not enough credits to use this feature"})
        }
        const{prompt, chatId, isPublished} = req.body

        // find chat 
        const chat = await Chat.findOne({userId, _id:chatId})

        // push user message
        chat.messages.push({role:"user",
        content:prompt,
        timestamp:Date.now(),
        isImage:false})

        // encode the prompt
        const encodedPrompt = encodeURIComponent(prompt)

        // construct the imagekit ai generation url
        const generatedImageUrl = `${process.env.IMAGEKIT_URL_ENDPOINT}/ik-genimg-prompt-${encodedPrompt}/${Date.now()}.png?tr=w-400,h-300,fo-auto`

            // trigger generation by fetching from Imagekit
        const aiImageResponse = await axios.get(generatedImageUrl,{responseType : "arraybuffer"})

        // covert to base-64 
        const base64Image = `data:image/png;base64,${Buffer.from(aiImageResponse.data,"binary").toString("base64")}`

        // upload to imagekit media library

        const uploadResponse = await imagekit.upload({
            file: base64Image,
            fileName: `${Date.now()}.png`,
            folder: "/ai-images"
        })

        const reply = {
            role: "assistant",
            content: uploadResponse.url, timestamp: Date.now(), isImage: true,
            isPublished
        }
            
            res.json({success: true, reply})
            chat.messages.push(reply)

            await chat.save()

            // deduct 2 credits from user account
            await User.updateOne({_id : userId}, {$inc: {credits: -2}})


    }catch( error){
        res.json({success: false, message:error.message})

    }
}