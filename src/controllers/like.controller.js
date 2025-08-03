import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user?._id;
  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid videoId");

  const foundVideo = await Like.findOne({ video: videoId, likedBy: userId });
  if (foundVideo) {
    const deletedVideo = await Like.findOneAndDelete({
      video: videoId,
      likedBy: userId,
    });
    if (!deletedVideo)
      throw new ApiError(500, "Error while deleting the liked  video.");
    res
      .status(200)
      .json(
        new ApiResponse(
          deletedVideo,
          200,
          "Successfully deleted the liked video."
        )
      );
  } else {
    const likedVideo = await Like.create({ video: videoId, likedBy: userId });
    if (!likedVideo)
      throw new ApiError(500, "Error while adding the likedVideo to db.");
    res
      .status(200)
      .json(
        new ApiResponse(likedVideo, 200, "Successfully added the liked video.")
      );
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user?._id;
  if (!isValidObjectId(commentId)) throw new ApiError(400, "Invalid commentId");

  const foundComment = await Like.findOne({
    comment: commentId,
    likedBy: userId,
  });
  if (foundComment) {
    const deletedComment = await Like.findOneAndDelete({
      comment: commentId,
      likedBy: userId,
    });
    if (!deletedComment)
      throw new ApiError(500, "Error while deleting the liked comment.");
    res
      .status(200)
      .json(
        new ApiResponse(
          deletedComment,
          200,
          "Successfully deleted the liked comment."
        )
      );
  } else {
    const likedComment = await Like.create({
      comment: commentId,
      likedBy: userId,
    });
    if (!likedComment)
      throw new ApiError(500, "Error while adding the liked comment to db.");
    res
      .status(200)
      .json(
        new ApiResponse(
          likedComment,
          200,
          "Successfully added the liked comment."
        )
      );
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const userId = req.user?._id;
  if (!isValidObjectId(tweetId)) throw new ApiError(400, "Invalid tweetId");

  const foundTweet = await Like.findOne({ tweet: tweetId, likedBy: userId });
  if (foundTweet) {
    const deletedTweet = await Like.findOneAndDelete({
      tweet: tweetId,
      likedBy: userId,
    });
    if (!deletedTweet)
      throw new ApiError(500, "Error while deleting the liked tweet.");
    res
      .status(200)
      .json(
        new ApiResponse(
          deletedTweet,
          200,
          "Successfully deleted the liked tweet."
        )
      );
  } else {
    const likedTweet = await Like.create({ tweet: tweetId, likedBy: userId });
    if (!likedTweet)
      throw new ApiError(500, "Error while adding the liked tweet to db.");
    res
      .status(200)
      .json(
        new ApiResponse(likedTweet, 200, "Successfully added the liked tweet.")
      );
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {

  const userId = req.user?._id;

  const likedVideos = await Like.find({
    likedBy: userId,
    video: { $exists: true },
  });
  res
    .status(200)
    .json(
      new ApiResponse(
        likedVideos,
        200,
        "Successfully fetched all the liked videos of user."
      )
    );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
