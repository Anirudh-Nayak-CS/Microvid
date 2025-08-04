import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/Apierror.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadFileOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  if (!isValidObjectId(userId)) throw new ApiError(400, "Invalid user Id.");

  const pages = parseInt(page) || 1;
  const limits = parseInt(limit) || 10;
  const options = {
    limit: limits,
    page: pages,
  };
  if (query) {
    matchStage.title = { $regex: query, $options: "i" };
  }
  const sortStage = {};
  if (sortBy) {
    sortStage[sortBy] = sortType == "desc" ? -1 : 1;
  }

  const Videoquery = Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
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
    {
      $addFields: {
        owner: {
          $first: "$owner",
        },
      },
    },
    ...(sortBy ? [{ $sort: sortStage }] : []),
  ]);
  const paginatedVideos = await Video.aggregatePaginate(Videoquery, options);
  res
    .status(200)
    .json(
      new ApiResponse(
        paginatedVideos,
        200,
        "Successfully fetched all of User's videos"
      )
    );
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!title) throw new ApiError(400, "Missing title.");
  if (!description) throw new ApiError(400, "Missing description.");

  const thumbnailPath = req.files?.thumbnail[0].path;
  if (!thumbnailPath) throw new ApiError(400, "Thumbnail is required.");
  const thumbnail = await uploadFileOnCloudinary(thumbnailPath);
  if (!thumbnail)
    throw new ApiError(400, "Error while uploading Thumbnail to cloudinary.");

  const videoFilePath = req.files?.videoFile[0].path;
  if (!videoFilePath) throw new ApiError(400, "Video file is required.");
  const videoFile = await uploadFileOnCloudinary(videoFilePath);
  if (!videoFile)
    throw new ApiError(400, "Error while uploading Video File to cloudinary.");
  const duration = videoFile.duration;
  const newVideo = await Video.create({
    title: title,
    description: description,
    thumbnail: thumbnail.url,
    videoFile: videoFile.url,
    owner: req.user?._id,
    duration: duration,
    isPublished: true,
  });
  if (!newVideo)
    throw new ApiError(500, "Something went wrong while publishing the video");
  res
    .status(200)
    .json(new ApiResponse(newVideo, 200, "Successfully published the video"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video Id.");

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video not found.");
  res
    .status(200)
    .json(new ApiResponse(video, 200, "Successfully fetched the video."));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video Id.");
  const { newtitle, newdescription } = req.body;
  if (!newtitle) throw new ApiError(400, "Missing title.");
  if (!newdescription) throw new ApiError(400, "Missing description.");
  const thumbnailPath = req.file?.path;
  if (!thumbnailPath) throw new ApiError(400, "Thumbnail is required.");
  const thumbnail = await uploadFileOnCloudinary(thumbnailPath);
  if (!thumbnail)
    throw new ApiError(400, "Error while uploading Thumbnail to cloudinary.");

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    { title: newtitle, description: newdescription, thumbnail: thumbnail.url },
    { new: true }
  );
  if (!updatedVideo) throw new ApiError(404, "Video not found.");
  res
    .status(200)
    .json(
      new ApiResponse(updatedVideo, 200, "Successfully updated the video.")
    );
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video Id.");
  const deletedVideo = await Video.findByIdAndDelete(videoId, { new: true });
  if (!deletedVideo) throw new ApiError(404, "Video not found.");
  res
    .status(200)
    .json(
      new ApiResponse(deletedVideo, 200, "Successfully deleted the video.")
    );
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video Id.");
  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video not found.");
  video.isPublished = !video.isPublished;
  await video.save();
  res
    .status(200)
    .json(
      new ApiResponse(video, 200, "Successfully toggled the publish status.")
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
