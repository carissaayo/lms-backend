import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    format: { type: String, required: true },
    sizeInKB: { type: String, required: true },
    sizeInMB: { type: String, required: true },
    originalName: { type: String, required: true },
    uploader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: { type: String, required: true },
  },
  { timestamps: true }
);
const Video = mongoose.model("video", videoSchema);

export default Video;
