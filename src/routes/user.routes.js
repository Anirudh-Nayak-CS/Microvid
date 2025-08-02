import { Router } from "express";
import {
  changeCurrentPassword,
  getUser,
  getUserChannelProfile,
  getWatchHistory,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updateAvatar,
  updateCoverImage,
  updateUserDetails,
} from "../controllers/user_controller.js";
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

userRouter.route("/login").post(loginUser);

//secured routes
userRouter.route("/logout").post(verifyJWT, logoutUser);
userRouter.route("/refreshToken").post(refreshAccessToken);
userRouter.route("/change-password").post(verifyJWT, changeCurrentPassword);
userRouter.route("/get-user").get(verifyJWT, getUser);
userRouter.route("/update-user-details").patch(verifyJWT, updateUserDetails);
userRouter
  .route("/update-avatar")
  .patch(verifyJWT, upload.single("avatar"), updateAvatar);
userRouter
  .route("/update-coverimage")
  .patch(verifyJWT, upload.single("coverImage", updateCoverImage));
userRouter.route("/c/:username").get(verifyJWT, getUserChannelProfile);
userRouter.route("/watchhistory").get(verifyJWT, getWatchHistory);

export { userRouter };
