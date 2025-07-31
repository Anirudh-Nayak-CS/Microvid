import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/Apierror.js";
import { User } from "../models/user.model.js";
import { uploadFileOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import jwt from "jsonwebtoken";
import { Subscription } from "../models/subscription.model.js";

const options = {
  httpOnly: true,
  secure: false,
};

const generateAccessTokenAndRefreshToken = async function (userid) {
  try {
    const user = await User.findById(userid);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Error while generating access token and refresh token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  //Take all the inputs (req.body u take info) from the user
  // validation-not empty
  // check if user already has inputs : username,email
  // check for images,avatar
  //upload them to cloudinary ,avatar
  // create user object -create entry in db
  // remove pw and refresh token from response
  // check for user creation - null or fine
  //return res

  const { fullName, username, password, email } = req.body;
  if (
    [fullName, username, password, email].some((field) => {
      return field?.trim() == "";
    })
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const foundUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (foundUser)
    throw new ApiError(
      409,
      "User with the particular username or email already exists"
    );

  const avatarLocalpath = req.files?.avatar[0]?.path;
  //const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalpath) throw new ApiError(400, "Avatar is required.");

  let coverImageLocalPath;
  if (req.files && Array.isArray(req.files) && req.files.coverImage.length > 0)
    coverImageLocalPath = req.files.coverImage[0].path;

  const avatarRes = await uploadFileOnCloudinary(avatarLocalpath);
  const coverImageRes = await uploadFileOnCloudinary(coverImageLocalPath);

  if (!avatarRes)
    throw new ApiError(400, "Error while uploading avatar on cloudinary");
  const user = await User.create({
    fullName,
    avatar: avatarRes.url,
    coverImage: coverImageRes?.url || "",
    email,
    username,
    password,
  });

  const addedUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!addedUser) throw new ApiError(500, "Error when registering the user");

  return res
    .status(201)
    .json(new ApiResponse(addedUser, 201, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  // take req.body info
  // check if any field is empty (required)
  // using email/name check if user exists in db if not say no user exists
  // if user exists in db compare the isPassword correct
  // issue jwt and refresh token
  //send cookie

  const { username, email, password } = req.body;
  if (!(username || email)) {
    throw new ApiError(400, "Username or password missing");
  }

  const foundUser = await User.findOne({ $or: [{ username }, { email }] });

  if (!foundUser) throw new ApiError(404, "User not found");

  const result = await foundUser.isPasswordCorrect(password);
  if (!result) throw new ApiError(401, "Wrong password");

  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(foundUser._id);

  const loggedInUser = await User.findById(foundUser._id).select(
    "-password -refreshToken"
  );

  res
    .status(200)
    .cookie("accesstoken", accessToken, options)
    .cookie("refreshtoken", refreshToken, options)
    .json(
      new ApiResponse(
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        200,
        "User successfully logged in"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { refreshToken: undefined },
    },
    { new: true }
  );

  return res
    .status(200)
    .clearCookie("accesstoken", options)
    .clearCookie("refreshtoken", options)
    .json(new ApiResponse(null, 200, "User logged out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const receivedRefreshToken =
    req.cookies?.refreshtoken || req.body.refreshtoken; //req.body is to handle mobile apps bcs built in cookie mechanism isn't present.
  if (!receivedRefreshToken)
    throw new ApiError(401, "Unauthorized request. No refreshtoken received.");

  try {
    const decodedToken = jwt.verify(
      receivedRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?._id);

    if (!user) throw new ApiError(401, "Invalid refresh token.");

    if (receivedRefreshToken != user?.refreshToken)
      throw new ApiError(401, "Refresh token is expired.");

    const { accessToken, newrefreshToken } =
      await generateAccessTokenAndRefreshToken(user._id);
    res
      .status(200)
      .cookie("accesstoken", accessToken, options)
      .cookie("refreshtoken", newrefreshToken, options)
      .json(
        new ApiResponse(
          { accessToken, refreshToken: newrefreshToken },
          200,
          "Access tokenn refreshed and generated new refresh token"
        )
      );
  } catch (error) {
    throw new ApiError(
      401,
      error?.message || "Something went wrong while refreshing access token."
    );
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { newPassword, oldPassword } = req.body;
  const user = await User.findById(req.user?._id);
  const res = await user.isPasswordCorrect(oldPassword, user.password);
  if (!res) throw new ApiError(401, "Old password is incorrect");
  user.password = newPassword; //password is hashed before saving to db (due to pre hook)
  await user.save({ validateBeforeSave: false });

  res
    .status(200)
    .json(new ApiResponse({}, 200, "Password changed successfully"));
});

const getUser = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) throw new ApiError(404, "User not found");
  res.status(200).json(new ApiResponse(user, 200, "User found successfully."));
});

const updateUserDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;
  if (!(fullName && email))
    throw new ApiError(400, "Missing email or fullName");

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: { fullName, email } },
    { new: true }
  ).select("-password -refreshToken");

  res
    .status(200)
    .json(new ApiResponse(user, 200, "Updated user details successfully"));
});

const updateAvatar = asyncHandler(async (req, res) => {
  const avatarpath = req.file?.path;
  if (!avatarpath) throw new ApiError(400, "Avatar is required");
  const avatarurl = await uploadFileOnCloudinary(avatarpath);
  if (!avatarurl)
    throw new ApiError(400, "Error while uploading avatar on cloudinary");
  const user = await User.findByIdAndUpdate(
    user?._id,
    { $set: { avatar: avatarurl } },
    { new: true }
  ).select("-password -refreshToken");
  res
    .status(200)
    .json(new ApiResponse(user, 200, "Updated Avatar successfully"));
});

const updateCoverImage = asyncHandler(async (req, res) => {
  const coverImagePath = req.file?.path;
  if (!coverImagePath) throw new ApiError(400, "Cover image is required");
  const coverImageUrl = await uploadFileOnCloudinary(coverImagePath);
  if (!coverImageUrl)
    throw new ApiError(400, "Error while uploading coverImage on cloudinary");

  const user = await User.findByIdAndUpdate(
    user?._id,
    { $set: { coverImage: coverImageUrl } },
    { new: true }
  ).select("-password -refreshToken");
  res
    .status(200)
    .json(new ApiResponse(user, 200, "Updated CoverImage successfully"));
});

const getUserChannelProfile=asyncHandler(async(req,res)=> {
   const {username}=req.params;
   if(!username?.trim())
    throw new ApiError(400,"username not found")
  const channel=await User.aggregate([
    {
     $match: {
      username:username?.trim().toLowerCase(),
     },
    },
    {
      $lookup:{
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers"
       }
      
    },
     {
      $lookup:{
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
       }
      
    },
    {
      $addFields: {
        subscribersCount:{
             $size:"$subscribers",
        },
        subscribedToCount:{
           $size:"$subscribedTo",
        },
        isSubscribed:
          { $cond: { if: { $in:[req.user?._id,"$subscribers.subscriber"]}, then: true, else: false }, }
        },
      
    },
    {
      $project:{
        fullName:1,
        username:1,
         subscribersCount:1,
          subscribedToCount:1,
          isSubscribed:1,
          avatar:1,
          coverImage:1,
          email:1,

      }
    }
  ])
  if(!channel?.length()) {
    throw new ApiError(404,"channel not found.")
  }
console.log(channel)
return res.status(200).json(new ApiResponse(channel[0],200,"User's channel found."))

})

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getUser,
  updateUserDetails,
  updateAvatar,
  updateCoverImage,
  getUserChannelProfile,
};
