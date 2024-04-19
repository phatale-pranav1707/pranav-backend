import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"

const userSchema = new mongoose.Schema({
       username :{
          type : String,
          required : true,
          unique : true,
          lowercase : true,
          trim : true,
          index : true,   // he karave searching fast hote
        
       },
       email :{
          type : String,
          required : true,
          unique : true,
          lowercase : true,
          trim : true,
          
        
       },
       fullname :{
        type : String,
        required : true,
        index :1,
        lowercase : true,
        trim : true,
        
     },
       avtar :{
        type : String,  //cloudnary url
        required : true,
        
        
     },

     coverimage :{
        type :String,

     },

     watchhistory : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "Video"
     }],

     password :{
        type : String,
        required : [true," password is req"]

     },

     refreshtoken :{
        type :String
     }
})

// jevha pn db madhe userdata save hot asel tyachya just agodar password hash krun ghyava
// password save zalyanantr next() call karava means userdata save hoil
// pn hr time password hash karaychi thodich garaj ahe
// means hr time jevha userdata save karaychi vel ali tevha password hash kru nye
// ashya veli if(!this.isModified("password")) return next(); hi condition lavavi
// this.isModified("password") sangte ki password change kela ahe ki nahi

userSchema.pre("save", async function (next){
     if(!this.isModified("password")) return next();

     this.password=bcrypt.hash(this.password,10)
     next()
})

userSchema.methods.isPasswordcorrect= async function (password){
    return await bcrypt.compare(password,this.password)
}

// bcrypt paasword chek karnyasathi pn use kele jate
// new password and encrypted adhicha password compare krun sangte

export const User = mongoose.model("User", userSchema)