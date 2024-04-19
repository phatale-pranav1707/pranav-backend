import dotenv from "dotenv"
// const dotenv=require("dotenv")
import { app } from "./app.js";
import connectDB from "./db/index.js";
dotenv.config({
    path : './env'
})

connectDB()   //async function ahe
.then(()=>{
    app.listen(process.env.PORT || 8000) // || 8000 khup faydyach ahe jevha server vr app crash krel
    console.log(`server is running at port ${process.env.PORT}`)
})
.catch((err)=>{
    console.log("db connection fail", err)
})