import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/Apierror.js";
import { User } from "../models/user.model.js";
import { uploadFileOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import jwt from "jsonwebtoken";

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
    
    const {accessToken,newrefreshToken}=await generateAccessTokenAndRefreshToken(user._id);
    res.status(200).cookie("accesstoken",accessToken,options).cookie("refreshtoken",newrefreshToken,options).json(new ApiResponse({accessToken,refreshToken: newrefreshToken},200,"Access tokenn refreshed and generated new refresh token"))
} catch (error) {
  throw new ApiError(401,error?.message || "Something went wrong while refreshing access token.")
}
});

export { registerUser, loginUser, logoutUser ,refreshAccessToken};
