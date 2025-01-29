import mongoose from "mongoose";

const pdfSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    contentType: { type: String, required: true },
    lecture: { type: mongoose.Schema.Types.ObjectId, ref: "Lecture" },
    sizeInKB: { type: String, required: true },
    sizeInMB: { type: String, required: true },
    originalName: { type: String, required: true },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);
const PDF = mongoose.model("pdf", pdfSchema);

export default PDF;
