import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/Apierror.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!isValidObjectId(channelId))
    throw new ApiError(400, "Invalid channel Id.");

  const existingSubscription = await Subscription.findOne({
    channel: channelId,
    subscriber: req.user?._id,
  });
  if (!existingSubscription) {
    const newSubscription = await Subscription.create({
      channel: channelId,
      subscriber: req.user?._id,
    });
    if (!newSubscription)
      throw new ApiError(500, "Error while creating a subscription.");
    res
      .status(200)
      .json(
        new ApiResponse(newSubscription, 200, "Created a new subscription")
      );
  } else {
    const removedSubscription = await Subscription.findOneAndDelete({
      channel: channelId,
      subscriber: req.user?._id,
    });
    if (!removedSubscription)
      throw new ApiError(500, "Error while removing the   subscription.");
    res
      .status(200)
      .json(
        new ApiResponse(removedSubscription, 200, "Deleted the subscription")
      );
  }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!isValidObjectId(channelId))
    throw new ApiError(400, "Invalid channel Id.");
  const subscribers = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscribers",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
  ]);
  if (!subscribers) {
    throw new ApiError(404, "Subscribers not found.");
  }
  res
    .status(200)
    .json(
      new ApiResponse(
        subscribers,
        200,
        "Successfully fetched channel subscribers."
      )
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  if (!isValidObjectId(subscriberId))
    throw new ApiError(400, "Invalid subscriber Id.");
  const subscribedchannels = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(subscriberId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "subscribedTo",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
  ]);
  if (!subscribedchannels) {
    throw new ApiError(404, "No subscribed channels  found.");
  }
  res
    .status(200)
    .json(
      new ApiResponse(
        subscribedchannels,
        200,
        "Successfully fetched subscribed channels."
      )
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
