import { useEffect,useRef } from "react";
import { useAppContext } from "../context/AppContext";
import { useState } from "react";
import { assets } from "../assets/assets";
import Message from "./Message";
import toast from "react-hot-toast";


const ChatBox  =()=>{

    const conatinerRef = useRef(null)

    const {selectedChats, fetchUserChats,theme, user, axios,token, setUser, isImage}=useAppContext()

    const [messages, setMessages]= useState([])
    const [loading,setLoading]=useState(false)

    const[prompt,setPrompt] = useState("")
    const[mode,setMode] = useState("text")
    const[isPublished,setIsPublished] = useState(false)

    const onSubmit=async(e)=>{
       
        try{
             e.preventDefault()
             if(!user) return toast("Please login to send a message")
                setLoading(true)    
                const promptCopy= prompt;
                setPrompt("")
                setMessages(prev => [...prev, {role:"user", content: prompt, timestamps: new Date(), isImage:false}])
                                       
                const {data} = await axios.post(`/api/message/${mode}`,{chatId: selectedChats._id, prompt, isPublished}, {headers:{Authorization: token}})

                if(data.success){
                    setMessages(prev => [...prev, data.reply])

                    // Refresh chats list to update timestamps
                    await fetchUserChats()
      
                    // decrease credits
                    if(mode === "image"){
                        setUser(prev=> ({...prev, credits: prev.credits -2}))
                    }else{
                        setUser(prev=> ({...prev, credits: prev.credits -1}))
                    }
                }else{
                    toast.error(data.message)
                    setPrompt(promptCopy)
                }
        }catch(error){
            toast.error(error.message)
        }finally{
           setPrompt("")
           setLoading(false)
        }
    }
    
    useEffect(()=>{
        if(selectedChats){
            setMessages(selectedChats.messages)
        }
    },[selectedChats])

    // it scroll by default to the latest message of any chat 
    useEffect(()=>{
        if(conatinerRef.current){
            conatinerRef.current.scrollTo({
                top: conatinerRef.current.scrollHeight,
                behavior:"smooth",
            })
        }
    })

    return (
        <div className="flex-1 flex flex-col justify-between m-5 md:m-10 xl:mx-30 max-md:mt-14 2x1:pr-40">

            {/* chat messages */}
            <div ref={conatinerRef} className="flex-1 mb-5 overflow-y-scroll">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center gap-2 text-primary">
                        <img src={theme=== "dark" ? assets.logo_full : assets.logo_full_dark} alt="" className="w-full max-w-56 sm:max-w-68"/>
                        <p className="mt-5 text-4xl sm:text-6xl text-center text-gray-400 dark:text-white">Ask me anything</p>
                    </div>
                )}

                {messages.map((message,index)=><Message key={index} message={message}/>)}

                {/* three dots animated loading */}
                {
                 loading && <div className="loader flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce"></div>
                    
                </div>
                }             
                
            </div>
            {
                // it checks if mode is image then you have option to published it to the community
                mode ==="image" && (
                    <label className="inline-flex flex-items-center gap-2 mb-3 text-sm mx-auto">
                        <p className="text-xs bg-transparent">Publish generated image to Community</p>
                        <input type="checkbox" className="cursor-pointer" checked={isPublished} onChange={(e)=>{setIsPublished(e.target.checked)}}/>
                    </label>
                )
            }
             {/* prompt input box */}
                <form onSubmit={onSubmit} className="bg-primary/20 dark:bg-[#583C79]/30 border border-primary dark:border-[#80609F]/30 rounded-full w-full max-w-2xl p-3 pl-4 mx-auto flex gap-4 items-center">
                    <select onChange={(e)=>{setMode(e.target.value)}} value={mode}  className="text-sm pl-3 pr-2 outline-none">
                        <option value="text" className=" dark:bg-purple-900">Text</option>
                        <option value="image" className="dark:bg-purple-900">Image</option>
                    </select>
                    <input onChange={(e)=>{setPrompt(e.target.value)}} value={prompt} type="text" placeholder="Ask here anything..." className="flex-1 w-full text-sm outline-none" required/>
                    <button disabled={loading}>
                        <img src={loading ? assets.stop_icon :assets.send_icon} alt="" className="w-8 cursor-pointer" />
                    </button>
                </form>
        </div>
    )
}

export default ChatBox 