import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/Apierror.js";
import { User } from "../models/user.js";
import { uploadFileOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import fs from "fs";
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
  if(req.files && Array.isArray(req.files) && req.files.coverImage.length>0)
    coverImageLocalPath=req.files.coverImage[0].path


  const avatarRes = await uploadFileOnCloudinary(avatarLocalpath);
  const coverImageRes = await uploadFileOnCloudinary(coverImageLocalPath);

  if (!avatarRes) throw new ApiError(400, "Avatar is required.");
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

export { registerUser };
