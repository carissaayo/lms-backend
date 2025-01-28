import fs from "fs";

import User from "../models/User.js";
import cloudinary from "../utils/cloudinary.js";
import {
  convertFileToKB,
  convertFileToMB,
} from "../utils/fileSizeConverter.js";
import Video from "../models/Video.js";

export const uploadVideo = async (req, res) => {
  try {
    // Valid User
    const user = await User.findOne({
      _id: req.user.id,
      deleted: false,
      role: "instructor",
    });

    if (!user) {
      return res
        .status(401)
        .json("Access Denied, you don't have the permission to upload a video");
    }
    const videoStuff = req.file;

    if (videoStuff.mimetype.substring(0, 6) !== "video/") {
      return res.status(401).json({ message: "only videos are supported" });
    }

    const result = await cloudinary.uploader.upload(req.file?.path, {
      resource_type: "video", // Specify video resource type
      folder: "videos", // Optional folder name in Cloudinary
      public_id: req.file?.title,
    });
    if (result) {
      fs.unlink("uploads/" + req.file.filename, (err) => {
        if (err) {
          console.error(`Error removing file: ${err}`);
          return;
        }

        console.log(`File ${req.file.filename} has been successfully removed.`);
      });
    }

    const newData = {
      title: req.body?.title,
      url: result.secure_url,
      publicId: result.public_id,
      format: videoStuff?.mimetype,
      sizeInKB: convertFileToKB(videoStuff?.size),
      sizeInMB: convertFileToMB(videoStuff?.size),
      originalName: videoStuff?.originalname,
      instructor: req.user.id,
    };
    const uploadVideo = new Video(newData);
    await uploadVideo.save();

    return res.status(200).json({
      message: "video uploaded successfully",
      uploadVideo,
    });
  } catch (error) {
    console.log("error uploading video", error);
    res.status(500).json({ message: "Video uploading  failed" });
  }
};

export const getVideo = async (req, res) => {
  try {
    const { id } = req.params;
    // Valid User
    const user = await User.findOne({
      _id: req.user.id,
      deleted: false,
    });

    if (!user) {
      return res
        .status(401)
        .json("Access Denied, you don't have the permission");
    }

    const getVideo = await Video.findById(id);

    return res.status(200).json({
      message: "video fetched successfully",
      getVideo,
    });
  } catch (error) {
    console.log("error fetching video", error);
    res.status(500).json({ message: "Video fetching  failed" });
  }
};
