import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!(name && description)) throw new ApiError(400, "Missing credentials.");
  const addPlaylist = await Playlist.create({
    name: name,
    description: description,
    owner: req.user?._id,
  });
  if (!addPlaylist) throw new ApiError(500, "Failed to add playlist.");
  res
    .status(200)
    .json(new ApiResponse(addPlaylist, 200, "Added playlist successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!isValidObjectId(userId)) throw new ApiError(400, "Invalid user ID.");
  const userplaylists = await Playlist.find({owner:userId});
  if (!userplaylists)
    throw new ApiError(404, "No playlists of the user exists.");
  res
    .status(200)
    .json(
      new ApiResponse(
        userplaylists,
        200,
        "Playlists of the user fetched successfully"
      )
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!isValidObjectId(playlistId))
    throw new ApiError(400, "Invalid playlist ID.");
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) throw new ApiError(404, "Playlist not found.");
  res
    .status(200)
    .json(new ApiResponse(playlist, 200, "Playlist fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!isValidObjectId(playlistId))
    throw new ApiError(400, "Invalid playlist ID.");
  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID.");
  const addVidToPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $push: {
        videos: new mongoose.Types.ObjectId(videoId),
      },
    },
    { new: true }
  );
  if (!addVidToPlaylist) throw new ApiError(404, "Playlist not found.");
  res
    .status(200)
    .json(
      new ApiResponse(
        addVidToPlaylist,
        200,
        "Video added to playlist successfully"
      )
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!isValidObjectId(playlistId))
    throw new ApiError(400, "Invalid playlist ID.");
  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID.");
  const removedVid = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $pull: {
        videos: new mongoose.Types.ObjectId(videoId),
      },
    },
    { new: true }
  );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!isValidObjectId(playlistId))
    throw new ApiError(400, "Invalid playlist ID.");
  const deletedplaylist = await Playlist.findByIdAndDelete(playlistId);
  if (!deletedplaylist) throw new ApiError(404, "Playlist not found.");
  res
    .status(200)
    .json(
      new ApiResponse(deletedplaylist, 200, "Playlist deleted successfully")
    );
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!isValidObjectId(playlistId))
    throw new ApiError(400, "Invalid playlist ID.");
  const { name, description } = req.body;
  if (!(name && description)) throw new ApiError(400, "Missing credentials.");
  const updatedplaylist = await Playlist.findByIdAndUpdated(
    playlistId,
    { name: name, description: description },
    { new: true }
  );
  if (!updatedplaylist) throw new ApiError(404, "Playlist not found.");
  res
    .status(200)
    .json(
      new ApiResponse(updatedplaylist, 200, "Playlist updated successfully")
    );
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
