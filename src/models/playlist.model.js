import mongoose from "mongoose";

const playlistSchema = mongoose.Schema(
  {
    name: {
      type: string,
      required: true,
    },
    description: {
      type: string,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    videos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
  },
  { timestamps: true }
);

export const Playlist = mongoose.model("Playlist", playlistSchema);
