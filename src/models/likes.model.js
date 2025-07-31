import mongoose from "mongoose";

const likesSchema = mongoose.Schema(
  {
    name: {
      type: string,
      required: true,
    },
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
    likedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    tweet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tweet",
    },
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
    },
  },
  { timestamps: true }
);

export const Like = mongoose.model("Like", likesSchema);
