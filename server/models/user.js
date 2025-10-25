import mongoose from "mongoose";
import bcrypt from "bcryptjs"
const userSchema =  new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true, 
        unique: true
    },
    password:{
        type:String,
        required:true, 
        unique: true
    },
    credits:{
        type:Number,
        default:50
    },
})

// Hash password before saving
userSchema.pre("save",async function (next){
    if(!this.isModified("password")){
        return next()
    }

    // salt is generated with 1024 (2*10)  rounds
    const salt = await bcrypt.genSalt(10)

    // password is converted into hashed form 
    this.password = await bcrypt.hash(this.password, salt)
    next();
})

const User = mongoose.model("User", userSchema)

export default User;