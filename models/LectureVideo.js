import mongoose from "mongoose";

const lectureVideoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    url: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { timestamps: true }
);
const LectureVideo = mongoose.model("lecture-video", lectureVideoSchema);

export default LectureVideo;
