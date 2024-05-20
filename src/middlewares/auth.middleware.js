import { ApiError } from "../utils/Apierror.js";
import { asyncHandler } from "../utils/asynchandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async(req,res,next)=>{
   try {
    const token= req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
 
    // aaplyala cookies kdun token milate
 
    if(!token){
       throw new ApiError(401, "Aunauthorizes request")
    }
 
   const decodedToken=  jwt.verify(token, process.env.ACCESS_TOKEN_SECRETE);
 
   const user=await User.findById(decodedToken?._id).select("-password -refreshtoken");
 
   if(!user){
     throw new ApiError(401, "invalid access token");
 
   }
 
   req.user=user
   next();
   } catch (error) {
      throw new ApiError(401, error?.message || "invalid access")
   }


})

// 