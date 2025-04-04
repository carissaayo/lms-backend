import { pdf } from "pdf-to-img";
import imageToPDF from "image-to-pdf";
import fs from "fs";
import axios from "axios";
import os from "os";
import path from "path";

import User from "../models/User.js";
import Video from "../models/Video.js";
import PDF from "../models/PDF.js";

import cloudinary from "../utils/cloudinary.js";
import {
  convertFileToKB,
  convertFileToMB,
} from "../utils/fileSizeConverter.js";
import { deleteFileFromDir, deletePdfImagesFromDir } from "../utils/uploads.js";

export const uploadVideo = async (req, res, file) => {
  try {
    // Valid User
    const user = await User.findOne({
      _id: req.user.id,
      deleted: false,
      isVerified: true,
    });

    if (!user) {
      return res
        .status(401)
        .json("Access Denied, you don't have the permission to upload a video");
    }

    if (file.mimetype.substring(0, 6) !== "video/") {
      return res.status(401).json({ message: "only videos are supported" });
    }

    const result = await cloudinary.uploader.upload(file?.path, {
      resource_type: "video", // Specify video resource type
      folder: "videos", // Optional folder name in Cloudinary
      public_id: file?.title,
    });
    if (result) {
      deleteFileFromDir(file);
    }

    const newData = {
      title: req.body?.title,
      url: result.secure_url,
      publicId: result.public_id,
      format: file?.mimetype,
      sizeInKB: convertFileToKB(file?.size),
      sizeInMB: convertFileToMB(file?.size),
      originalName: file?.originalname,
      uploader: req.user.id,
      role: req.user.role,
    };
    const uploadVideo = new Video(newData);
    await uploadVideo.save();

    return {
      message: "video uploaded successfully",
      uploadVideo,
    };
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

export const uploadDocs = async (req, res, file) => {
  try {
    // Valid User
    const user = await User.findOne({
      _id: req.user.id,
      deleted: false,
      isVerified: true,
    });

    if (!user) {
      return res
        .status(401)
        .json("Access Denied, you don't have the permission to upload");
    }

    if (!file) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const results = [];

    const pdfPath = file.path; // Path to the uploaded

    // Ensure the folder exists
    await fs.promises.mkdir(`${req.user.id}-pdf-images`, { recursive: true });
    const document = await pdf(pdfPath, { scale: 3 });
    let counter = 1;
    for await (const image of document) {
      await fs.promises.writeFile(
        `${req.user.id}-pdf-images/${file.originalname}${counter}.png`,
        image
      );
      // Optionally, upload each image to Cloudinary
      const uploadedImage = await cloudinary.uploader.upload(
        `${req.user.id}-pdf-images/${file.originalname}${counter}.png`,
        {
          folder: `${req.user.id}-pdf-images-${file.originalname}`,
          use_filename: true,
        }
      );
      if (uploadedImage) {
        deletePdfImagesFromDir(
          `${req.user.id}-pdf-images/${file.originalname}${counter}.png`
        );
      }
      results.push(uploadedImage);
      counter++;
    }

    const data = {
      title: file.originalname,
      sizeInKB: convertFileToKB(file.size),
      sizeInMB: convertFileToMB(file.size),
      uploader: req.user.id,
      fileFolder: `${req.user.id}-pdf-images-${file.originalname}`,
      role: req.user.role,
    };
    const createdDoc = await PDF.create(data);

    if (createdDoc) {
      // await fs.promises.unlink(pdfPath);

      // Delete the folder containing extracted images
      await fs.promises.rm(`${req.user.id}-pdf-images`, {
        recursive: true,
        force: true,
      });
    }
    deleteFileFromDir(file);

    return {
      message: "File uploaded successfully",
      file: createdDoc,
    };
  } catch (error) {
    // await fs.promises.unlink(pdfPath);
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
      width: 500,
      height: 700,
      crop: "limit",
      format: "jpg",
    });
    if (fetchImagesFolder.resources.length === 0) {
      return res.status(404).json({ message: "no folder found in storage" });
    }
    const imagesUrls = fetchImagesFolder.resources.map(
      (file) => file.secure_url
    );

    // Step 2: Download the images locally
    const imagePaths = [];
    for (const [index, url] of imagesUrls.entries()) {
      const imageResponse = await axios.get(url, {
        responseType: "arraybuffer",
      });
      const imagePath = `./docs/image_${index}.jpg`; // Save each image locally
      fs.writeFileSync(imagePath, imageResponse.data);
      imagePaths.push(imagePath);
    }

    const fileName = folderName.slice(11);
    // Step 3: Convert images to PDF
    const pdfFilePath = path.join(os.tmpdir(), `${folderName}`);
    // const pdfFilePath = `./docs/${fileName}`;
    imageToPDF(imagePaths, "A4").pipe(fs.createWriteStream(pdfFilePath));

    // Step 4: Send the PDF as a response
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);

    // Delete the images
    imagePaths.forEach((path) => fs.unlinkSync(path));

    res.status(200).json({ message: "done" });
  } catch (error) {
    console.log("error fetching file", error);
    res.status(500).json({ message: "File fetching failed" });
  }
};
