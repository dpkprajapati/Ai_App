import { createContext, useContext} from "react";                //context api lets you use your state variables across the entire app without pasing it child to child that helps to prevent prop drilling
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useEffect } from "react";
import { dummyChats, dummyUserData } from "../assets/assets";


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
    
    const fetchUser = async ()=>{
        setUser(dummyUserData)
    }
    
    const fetchUserChats= async () =>{
        setChats(dummyChats)
        setSelectedChats(dummyChats[0])
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
        fetchUser()
    },[])

    //Create value object containing all state and functions
    // This object is passed to all child components via Context
    const value ={
        navigate, user, setUser,fetchUser,chats, setChats,selectedChats, setSelectedChats,theme ,setTheme
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