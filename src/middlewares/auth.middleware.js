import { ApiError } from "../utils/Apierror.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import  jwt  from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
   
    const token =
      req.cookies?.accesstoken || req.headers.authorization?.split(" ")[1];  
    if (!token) throw new ApiError(401, "Unauthorized. No token received.");

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );
    if (!user) throw new ApiError(401, "JWT verification failed.");
    req.user = user;
    next();

    //In frontend if 401 error is received. If such error is received , hit a endpoint and from there refresh access token . In that request send your refresh token  and from backend we check if backend refresh token=frontend if matched then a new access token is made and also a new refresh token.
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Access token ");
  }
});
