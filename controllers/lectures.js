import Course from "../models/Course.js";
import Lecture from "../models/Lecture.js";
import User from "../models/User.js";
import { uploadDocs, uploadVideo } from "./fileUpload.js";

// create a lecture
export const createLecture = async (req, res) => {
  try {
    const { courseId } = req.params;
    // Valid User
    const user = await User.findOne({
      _id: req.user.id,
      deleted: false,
      role: "instructor",
    });

    if (!user) {
      return res
        .status(401)
        .json(
          "Access Denied, you don't have the permission to create a lecture"
        );
    }

    // is the course available and not deleted
    const validCourse = await Course.findOne({
      _id: courseId,
      deleted: false,
    });
    if (!validCourse) {
      return res.status(401).json("Course can't be found");
    }

    const video = await uploadVideo(req, res, req.files["video"][0]);
    const docs = await uploadDocs(req, res, req.files["notes"][0]);

    const vid = video.uploadVideo;
    const doc = docs.file;

    const newData = {
      video: vid._id,
      notes: doc._id,
      instructor: req.user.id,
      course: courseId,
      title: req.body.title,
      duration: req.body.duration,
    };

    const newLecture = new Lecture(newData);
    validCourse.lectures.push(newLecture);

    await newLecture.save();
    await validCourse.save();
    return res.status(200).json({
      message: "lecture has been created successfully",
      lecture: newLecture,
    });
  } catch (error) {
    console.log("error creating lecture", error);
    res.status(500).json({ message: "Lecture creation  failed" });
  }
};

// get a single lecture
export const getSingleLecture = async (req, res) => {
  try {
    const { id } = req.params;

    // does the lecture exist
    const validLecture = await Lecture.findOne({
      _id: id,
      deleted: false,
    });

    if (!validLecture) {
      return res.status(401).json("lecture can't be found");
    }

    // has the lecture been deleted already
    const deletedLecture = await Lecture.findOne({
      _id: id,
      deleted: true,
    });

    if (deletedLecture) {
      return res.status(401).json("lecture has been deleted");
    }

    return res.status(200).json({
      message: "lecture  found successfully",
      lecture: validLecture,
    });
  } catch (error) {
    console.log("error searching a lecture", error);
    res.status(500).json({ message: "Lecture search failed" });
  }
};

export const getAllLecturesInACourse = async (req, res) => {
  try {
    const { id } = req.params;

    // does the lecture exist
    const allLecturesInACourse = await Lecture.find({
      deleted: false,
      course: id,
    }).sort({ createdAt: 1 });

    const course = await Course.findOne({ _id: id, deleted: false });

    if (!allLecturesInACourse[0]) {
      res.status(401).json("no lecture was found");
    }

    return res.status(200).json({
      message: "lectures  found successfully",
      lectures: allLecturesInACourse,
      course: course,
    });
  } catch (error) {
    console.log("error fetching lectures", error);
    res.status(500).json({ message: "Lectures fetching failed" });
  }
};

// update a lecture
export const updateLecture = async (req, res) => {
  try {
    const { id } = req.params;

    // does the lecture exist
    const validLecture = await Lecture.findOne({
      _id: id,
      deleted: false,
    });

    if (!validLecture) {
      return res.status(401).json("lecture can't be found");
    }

    // has the lecture been deleted already
    const deletedLecture = await Lecture.findOne({
      _id: id,
      deleted: true,
    });

    if (deletedLecture) {
      return res.status(401).json("lecture has been deleted");
    }
    let video = {};
    let docs = {};

    if (req.files["video"][0]) {
      video = await uploadVideo(req, res, req.files["video"][0]);
    }
    if (req.files["notes"][0]) {
      docs = await uploadDocs(req, res, req.files["notes"][0]);
    }

    const vid = video?.uploadVideo;
    const doc = docs?.file;
    const newData = {
      video: vid && vid._id,
      notes: doc && doc._id,
      title: req.body.title && req.body.title,
      duration: req.body.duration && req.body.duration,
    };

    const updateLecture = await Lecture.findByIdAndUpdate(
      { _id: id },
      newData,
      { new: true }
    );

    return res.status(200).json({
      message: "lecture  updated successfully",
      lecture: updateLecture,
    });
  } catch (error) {
    console.log("error updating a lecture", error);
    res.status(500).json({ message: "Lecture update failed" });
  }
};

// delete a single lecture
export const deleteSingleLecture = async (req, res) => {
  try {
    const { id } = req.params;

    // is the course available and not deleted
    const validLecture = await Lecture.findOne({
      _id: id,
    });

    if (!validLecture) {
      return res.status(401).json("lecture does not exist");
    }

    // has the lecture been deleted already
    const alreadyDeletedLecture = await Lecture.findOne({
      _id: id,
      deleted: true,
    });

    if (alreadyDeletedLecture) {
      return res.status(401).json("lecture has already been deleted");
    }
    await Lecture.findByIdAndUpdate(id, { deleted: true }, { new: true });
    return res.status(200).json({
      message: "lecture  deleted successfully",
    });
  } catch (error) {
    console.log("error creating lecture", error);
    res.status(500).json({ message: "Lecture search failed" });
  }
};

// delete all lectures in a course
export const deleteAllLectureInACourse = async (req, res) => {
  try {
    const { id } = req.params;

    // is the course  deleted
    const isDeletedCourse = await Course.findOne({
      _id: id,
      deleted: true,
    });

    if (isDeletedCourse) {
      res.status(401).json("course has been deleted");
    }

    // is the course available
    const validCourse = await Course.findById({
      _id: id,
    });

    if (!validCourse) {
      return res.status(401).json("course does not exist");
    }

    await Lecture.updateMany(
      { _id: { $in: validCourse.lectures } }, // Match all referenced lectures
      { $set: { deleted: true } }, // Set the `deleted` field to true
      { new: true }
    );
    await Course.findByIdAndUpdate(
      { _id: id },
      { lectures: [] },
      { new: true }
    );

    return res.status(200).json({
      message: "lectures  deleted successfully",
    });
  } catch (error) {
    console.log("error creating lecture", error);
    res.status(500).json({ message: "Lecture search failed" });
  }
};
