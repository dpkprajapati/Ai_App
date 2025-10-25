import { createContext, useContext} from "react";                //context api lets you use your state variables across the entire app without pasing it child to child that helps to prevent prop drilling
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

// Set the base URL for axios requests

axios.defaults.baseURL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000"

// Create a Context object to share state across the entire app
// This allows child components to access global state without prop drilling
const AppContext = createContext()

// Provider component that wraps the app and provides context values to all children
export const AppContextProvider =({children})=>{

    const navigate = useNavigate()
    const [user, setUser]= useState(null)
    const [chats, setChats]= useState([])
    const [selectedChats, setSelectedChats]= useState(null)
    const [theme, setTheme]= useState(localStorage.getItem("theme") || "light");
    const [token, setToken]= useState(localStorage.getItem("token") || null);
    const [loadingUser, setLoadingUser]= useState(false);

    const fetchUser = async ()=>{
        try {
            const {data} = await axios.get("/api/user/data", {headers:{Authorization:token}})
            if (data.success){
                setUser(data.user)
            }
            else{
                toast.error(data.message)
            }

            
        } catch (error) {
            toast.error(error.message)
        }
        finally{
            setLoadingUser(false)
        }
    }


    const createNewChat = async () =>{
        try{
            if(!user) return toast.error("Please login to create a new chat")
           
            navigate("/")  //navigates to home page
            await axios.get("/api/chat/create",{headers:{Authorization: token}}) 
            await fetchUserChats()
        }catch{
            toast.error(error.message)
        }
    }
    
    const fetchUserChats= async () =>{
        try{
            const {data} = await axios.get("/api/chat/get", {headers:{Authorization: token}})
            if(data.success){
                const currentSelectedId = selectedChats?._id
                setChats(data.chats) 
                // if user has no chats, create a new chat  
                if (data.chats.length === 0){
                    await createNewChat()
                    return fetchUserChats()
                }else{
                    // maintain selected chat after fetching chats
                     if(currentSelectedId) {
                        // Find and update the currently selected chat
                        const updatedSelectedChat = data.chats.find(chat => chat._id === currentSelectedId)
                        if(updatedSelectedChat) {
                            setSelectedChats(updatedSelectedChat)
                        } else {
                            // If current chat was deleted, select first one
                            setSelectedChats(data.chats[0])
                        }
                    } else {
                        // No chat selected yet, select the first one
                        setSelectedChats(data.chats[0])
                    }
                }    
            }
            else{
                toast.error(data.message)   

            }
        }catch{
            toast.error(error.message) 
        }
    }

    useEffect(()=>{
        if(theme==="dark"){
            document.documentElement.classList.add("dark")
        }else{
            document.documentElement.classList.remove("dark")
        }
        localStorage.setItem("theme", theme)
    },[theme])

    useEffect(()=>{
        if(user){
            fetchUserChats()
        }
        else{
            setChats([])
            setSelectedChats(null)
        }
    },[user])

    useEffect (()=>{
        if(token){
            setLoadingUser(true)
            fetchUser()
        }
        else{
            setUser(null)
            setLoadingUser(false)                          
        }
    },[token])

    //Create value object containing all state and functions
    // This object is passed to all child components via Context
    const value ={
        navigate, user, setUser,fetchUser,chats, setChats,selectedChats, setSelectedChats,theme ,setTheme, token, setToken, loadingUser, createNewChat, fetchUserChats, axios
    }

    return (
        // Provide the context value to all child components
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}
 
// CUSTOM HOOK: Simplified way to use the AppContext
// Instead of importing both useContext and AppContext in every component,
// just import and call useAppContext() to access all global state
export const useAppContext = ()=>useContext(AppContext)