import { Router } from "express";
import { loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/user_controller.js";
import { upload } from "../middlewares/multer.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.route("/register").post(
  //take files from user ( a way to take files from user bcs by default we cannot take it/send it in req.body)  and upload in local server using multer
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

userRouter.route("/login").post(
loginUser
);


//secured routes
userRouter.route("/logout").post(verifyJWT,logoutUser)
userRouter.route('/refreshToken').post(refreshAccessToken)

export { userRouter };
