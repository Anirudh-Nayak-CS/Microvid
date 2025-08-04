import { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/Apierror.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID.");
  const { page = 1, limit = 10 } = req.query;
  const pages = parseInt(page) || 1;
  const limits = parseInt(limit) || 10;
  const options = {
    limit: limits,
    page: pages,
  };

  const getVideoComments = Comment.aggregate([
    {
      $match: {
        video: videoId,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "commentby",
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "CommentonwhichVideo",
      },
    },
    {
      $project: {
        content: 1,
        owner: {
          $first: "$commentby",
        },
        video: {
          $first: "$CommentonwhichVideo",
        },
      },
    },
  ]);

  if (!getVideoComments)
    throw new ApiError(404, "No comments found for this video.");
  const paginatedComments = await Comment.aggregatePaginate(
    getVideoComments,
    options
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        paginatedComments,
        200,
        "Successfully fetched the Video comments."
      )
    );
});

const addComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID.");
  if (!content) throw new ApiError(400, "No content received from user.");

  const createdComment = await Comment.create({
    content: content,
    owner: req.user?._id,
    video: videoId,
  });
  if (!createdComment)
    throw new ApiError(500, "Error while creating the comment");

  res
    .status(200)
    .json(
      new ApiResponse(createdComment, 200, "Successfully created the comment.")
    );
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!isValidObjectId(commentId))
    throw new ApiError(400, "Invalid comment ID.");
  const { newContent } = req.body;
  if (!newContent) throw new ApiError(400, "No content received from user.");
  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    { content: newContent },
    { new: true }
  );
  if (!updateComment) throw new ApiError(404, "No comment found");

  res
    .status(200)
    .json(
      new ApiResponse(updatedComment, 200, "Successfully updated the comment.")
    );
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!isValidObjectId(commentId))
    throw new ApiError(400, "Invalid comment ID.");
  const deletedComment = await Comment.findByIdAndDelete(commentId);

  if (!deletedComment) throw new ApiError(404, "No comment found");

  return res
    .status(200)
    .json(
      new ApiResponse(deletedComment, 200, "Successfully deleted the comment.")
    );
});

export { getVideoComments, addComment, updateComment, deleteComment };
