import { promises as fs } from "node:fs";
import { pdf } from "pdf-to-img";

import User from "../models/User.js";
import cloudinary from "../utils/cloudinary.js";
import {
  convertFileToKB,
  convertFileToMB,
} from "../utils/fileSizeConverter.js";
import Video from "../models/Video.js";
import PDF from "../models/PDF.js";
import { request } from "node:http";
import { deleteFileFromDir, deletePdfImagesFromDir } from "../utils/uploads.js";

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
      deleteFileFromDir;
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

export const uploadDocs = async (req, res) => {
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
        .json("Access Denied, you don't have the permission to upload");
    }

    if (!req.file) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const results = [];
    const file = req.file;
    console.log(file);

    const pdfPath = req.file.path; // Path to the uploaded PDF

    const document = await pdf(pdfPath, { scale: 3 });
    let counter = 1;
    for await (const image of document) {
      await fs.writeFile(
        `pdf-images/${file.originalname}${counter}.png`,
        image
      );
      // Optionally, upload each image to Cloudinary
      const uploadedImage = await cloudinary.uploader.upload(
        `pdf-images/${file.originalname}${counter}.png`,
        {
          folder: `pdf-images-${file.originalname}`,
          use_filename: true,
        }
      );
      if (uploadedImage) {
        deletePdfImagesFromDir(`pdf-images/${file.originalname}${counter}.png`);
      }
      results.push(uploadedImage);
      counter++;
    }
    if (results.length > 0) {
      deleteFileFromDir(file);
    }
    const fetchImagesFolder = await cloudinary.api.resources({
      type: "upload",
      prefix: `pdf-images-${file.originalname}`, // Filter by folder
    });

    const data = {
      title: file.originalname,
      sizeInKB: convertFileToKB(file.size),
      sizeInMB: convertFileToMB(file.size),
      instructor: req.user.id,
      fileFolder: `pdf-images-${file.originalname}`,
    };
    const createdDoc = await PDF.create(data);

    return res.status(200).json({
      message: "File uploaded successfully",
      file: createdDoc,
    });
  } catch (error) {
    console.log("error uploading file", error);
    res.status(500).json({ message: "File uploading  failed" });
  }
};

export const getFiles = async (req, res) => {
  try {
    const { folderName } = req.params;
    const fetchImagesFolder = await cloudinary.api.resources({
      type: "upload",
      prefix: folderName, // Filter by folder
    });

    console.log(fetchImagesFolder);
    res.status(200).json(fetchImagesFolder);
  } catch (error) {
    console.log(error);
  }
};
