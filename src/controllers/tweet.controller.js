import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content) throw new ApiError(400, "Content for tweet is absent.");
  const user_id = req.user?._id;
  const createdTweet = await Tweet.create({
    content: content,
    owner: user_id,
  });
  if (!createdTweet) throw new ApiError(500, "Error while creating the tweet");

  return res
    .status(200)
    .json(new ApiResponse(createdTweet, 200, "Successfully created the tweet."));
});

const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const userTweets=await Tweet.aggregate([
    {
        $match:{
            owner:new mongoose.Types.ObjectId(userId)
        }
    },
     {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owneroftweet",
      },
    },
    {
      $project:{
        content:1,
        owner:{
          $first:"$owneroftweet",
        }
      }
    }
   
  ])
  if(!userTweets)
    throw new ApiError(404, "No tweets by the user.");

  res.status(200).json(new ApiResponse(userTweets,200,"User tweets fetched successfully."))
});

const updateTweet = asyncHandler(async (req, res) => {
  const { updatedcontent } = req.body;
  const { tweetId } = req.params;
  if (!updatedcontent) throw new ApiError(400, "Content for tweet is absent.");

  const updatedTweet = await Tweet.findByIdAndUpdate(
    tweetId,
    { content: updatedcontent },
    { new: true }
  );

  if (!updatedTweet) throw new ApiError(404, "No tweet found");

  return res
    .status(200)
    .json(
      new ApiResponse(updatedTweet, 200, "Successfully updated the tweet.")
    );
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  const deletedTweet = await Tweet.findByIdAndDelete(tweetId);

  if (!deletedTweet) throw new ApiError(404, "No tweet found");

  return res
    .status(200)
    .json(
      new ApiResponse(deletedTweet, 200, "Successfully deleted the tweet.")
    );
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
