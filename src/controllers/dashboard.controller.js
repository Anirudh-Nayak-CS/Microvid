import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/Apierror.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
 
  const userId = req.user?._id;
  const channelVideos = await Video.find({ owner: userId });
  if (!channelVideos) throw new ApiError(404, "Channel videos not found");

  const totalnumberOfVideos = await Video.countDocuments({ owner: userId });
  if (!totalnumberOfVideos)
    throw new ApiError(500, "Something went wrong while finding totalVideos");
  const totalSubscribers = await Subscription.countDocuments({
    channel: userId,
  });
  if (!totalSubscribers)
    throw new ApiError(
      500,
      "Something went wrong while finding totalSubscribers"
    );
  const totalLikes = await Like.countDocuments({ likedBy: userId });
  if (!totalLikes)
    throw new ApiError(500, "Something went wrong while finding totalLikes");
  const totalVideoviews = 0;
  for (let i = 0; i < totalVideos; i++)
    totalVideoviews += channelVideos[i].views;
  res
    .status(200)
    .json(
      new ApiResponse(
        {
          totalVideoviews: totalVideoviews,
          totalSubscribers: totalSubscribers,
          totalLikes: totalLikes,
          totalnumberOfVideos: totalnumberOfVideos,
        },
        200,
        "Successfully fetched channel stats"
      )
    );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  const channelVideos = await Video.find({ owner: userId });
  if (!channelVideos) throw new ApiError(404, "Channel videos not found");
  res
    .status(200)
    .json(
      new ApiResponse(
        channelVideos,
        200,
        "Successfully fetched channel videos."
      )
    );
});

export { getChannelStats, getChannelVideos };
