import { ApiError } from "../utils/Apierror";
import { asyncHandler } from "../utils/asyncHandler";
import { jwt } from "jsonwebtoken";
import { User } from "../models/user.model";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken || req.headers.Authorization?.split(" ")[1];
    if (!token) throw new ApiError(401, "Unauthorized. No token received.");

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_PUBLIC_KEY);
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );
    if (!user) throw new ApiError(401, "JWT verification failed.");
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Access token ");
  }
});
