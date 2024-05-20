import { asyncHandler } from "../utils/asynchandler.js";
import {ApiError} from "../utils/Apierror.js"
import {User} from "../models/user.model.js"
import {uploadFileOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";


const generateAccessAndRefreshToken = async (userId)=>{
    try {

        const user= await User.findById(userId);

        const accessToken=await user.generateAccessToken();
        const refreshToken=await user.generateRefreshToken();

        // refreshToken db madhe save karav lagel

        user.refreshtoken=refreshToken;
        user.save({validateBeforeSave : false});


        return {accessToken,refreshToken}

        
    } catch (error) {
        throw new ApiError(500, "something went wrong at access and refresh token")
    }
}

const registerUser  = asyncHandler(async(req,res)=>{
    // get user details from frontend -> ha data jo user schema banvla ahe tyanusar ghyava
    // validation
    // check if user already exists : unique username and email
    //  check for images , check for avtar
    // upload them to cloudinary, avtar
    // create user object - create entry in DB
    // remove password and refresh token from response
    // check for user creation 
    // return response

    // user kdun data req.body kdun yet ahe

    console.log(req.body);

    const {fullName, email, username, password} = req.body 

    console.log("email : " , email);
    console.log("fullName : " , fullName);
    console.log("username : " , username);
    console.log("password : " , password);
    // console.log("email : " , email);

    if(fullName === ""){
        throw new ApiError(400, "fullname is required")
    }
    if(email === ""){
        throw new ApiError(400, "email is required")
    }
    if(username === ""){
        throw new ApiError(400, "username is required")
    }
    if(password === ""){
        throw new ApiError(400, "password is required")
    }

    const existedUser = await User.findOne({
        $or : [{username},{email}]
    })


    if(existedUser){
        throw new ApiError(409, "this user is alredy exists")
    }

    // req.body madhe sarv data yeto
    // multer aplyala files cha access deto 
    // multer ha middelware madhech means req madhe files add krto -> using req.files 

   const avtarLocalPath = req.files?.avtar[0]?.path;
   const coverImageLocalPath = req.files?.coverImage[0]?.path;

    //   let coverImageLocalPath;

    //   if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage){
    //       coverImageLocalPath=req.files.coverImage.path;
    //   }

   if(!avtarLocalPath){
    throw new ApiError(400, "Avtar file is required");
   }

   console.log(coverImageLocalPath)

   const avtar= await uploadFileOnCloudinary(avtarLocalPath)
   const coverImage= await uploadFileOnCloudinary(coverImageLocalPath)

   if(!avtar){
    throw new ApiError(400, "Avtar file is required");
   }

   const user= await User.create({
     fullname :fullName,
     avtar : avtar.url,
     coverImage : coverImage?.url || avtar?.url || "",
     email,
     password,
     username : username.toLowerCase()
   })

   console.log(user);
   console.log(user.coverImage);

   const createdUser=await User.findById(user._id).select(
     "-password -refreshToken"  // remove passoword and refresh token from response
   )

   if(!createdUser){
    throw new ApiError(500, "something went wrong while registering the user")
   }




   return res.status(201).json(
     new ApiResponse(200, createdUser, "User registered successfully")
   )




 
})

// postman madhe jr fkt data pathvycha asel tr aapn JSON ne pathvto
// but data sob files pn pathvaychya aahet mhnun form cha use karava

const loginUser = asyncHandler (async (req,res)=>{
     // req.body -> data gheun ya
     // username or emial
     // find the user 
     // check password 
     // access token and refresh token
     // send cookies 

     const {email, username, password} = req.body;

     if(!username && !email){
        throw new ApiError(400, "username or email is required")
     }

     const user= await User.findOne({
        $or : [{username}, {email}]
     })

     if(!user){
        throw new ApiError(404, "user not exist")
     }

     // pro tip -> password checking sathi je aapn models madhe function lihile aahet te User ya mongoose model ne access hot nahit, tr jo aapn user find kela ahe tyane access krta yete passwoord checking cha function

     const ispasswordvalid = await user.isPasswordcorrect(password);

     if(!ispasswordvalid){
        throw new ApiError(401, "password incorrect")
     }

     const {accessToken,refreshToken}= await  generateAccessAndRefreshToken(user._id);

     const loggedInUser= await User.findById(user._id).select("-password -refreshtoken");

     const options = {
        httpOnly : true,
        secure : true
     }

     res.status(200)
     .cookie("accessToken", accessToken, options)
     .cookie("refreshtoken", refreshToken, options)
     .json(
        new ApiResponse(
            200,
           {
              user : loggedInUser, accessToken, refreshToken
           },

           "user logged in successfully"
        )
     )






})

const logoutUser = asyncHandler (async (req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set :{
                refreshtoken : undefined
            }
        },

        {
            new : true
        }
    )

    // varil kamamule refresh token db madhe undefined hoto 
    const options = {
        httpOnly : true,
        secure : true
     }

     return res.status(200)
     .clearCookie("accessToken", options)
     .clearCookie("refreshtoken",options)
     .json(new ApiResponse(200, {}, "User logged out"))


})

// access token and refresh token concept ->

/*
1. yanch itkch kaam ahe ki user la sarkh sarkh email ani password dyayla lagu nye
2. access token short lived aste ani tyacha time 15 min 1 hour,  1 day asa kahi pn asu shkto
3. jevha session expire hoil tevha frontend la 401 response yeil
4. yaveli ek code chalvla jato -> jevha backend madhe store aslela refresh oken ani 401 sobat aalela request token same asel tevha access token punha refresh hoto v user logged in ch rahto
5. 
*/ 

const refreshAccessToken = asyncHandler(async(req,res)=>{
   const incomingRefreshToken = req.cookies.refreshtoken || req.body.refreshtoken ;

   if(!incomingRefreshToken){
    throw new ApiError(401, "unauthorised request")
   }

   try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRETE);
 
    const user=await User.findById(decodedToken._id);
 
    if(!user){
       throw new ApiError(401, "invalid refresh token")
    }
 
    if(incomingRefreshToken !== user?.refreshtoken){
     throw new ApiError(401, "invalid refresh token")
    }
 
    const options ={
      httpOnly : true,
      secure : true
    }
 
    const {accessToken,newRefreshToken}=await generateAccessAndRefreshToken(user._id);
 
    return res.status(200).cookie("accessToken",accessToken).cookie("refreshtoken",newRefreshToken)
    .json(
     new ApiResponse(
         200,
         {
             accessToken, newRefreshToken
 
         },
         "Access token refreshed successfully"
     )
    )
 
 
 
   } catch (error) {
      throw new ApiError(401, "error in refreshing access token")
   }



})



export {registerUser,loginUser, logoutUser, refreshAccessToken}