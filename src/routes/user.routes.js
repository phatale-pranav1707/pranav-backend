// users che sarv endpoints
import { Router } from "express";
import { loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middlewear.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const userRouter =Router()

 userRouter.route("/register").post(
    upload.fields([
        {
            name : "avtar",
            maxCount : 1
        },
        {
            name : "coverImage",
            maxCount : 1
        }

    ]),
    registerUser
)

// -> http://localhost:8000/users/register
// users vr gelyavr resgister kaam krel

userRouter.route("/login").post(loginUser)
userRouter.route("/logout").post(verifyJWT, logoutUser);
userRouter.route("/refresh-token").post(refreshAccessToken);

// verify jwt ya middle ware madhe next() ahe to next verify zalyavr next function run karayla sangto,
// next function logoutuser ahe



export default userRouter 