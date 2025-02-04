import Assignment from "../models/Assignment.js";

import User from "../models/User.js";
import { uploadDocs } from "./fileUpload.js";

export const createAssignment = async (req, res) => {
  try {
    const { lectureId } = req.params;

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
          "Access Denied, you don't have the permission to create an assignment"
        );
    }

    if (!req.body) {
      return res.status(401).json({ message: "No data was provided" });
    }

    const newData = {
      instructor: req.user.id,
      lecture: lectureId,
      description: req.body.description,
      title: req.body.title,
      questions: req.body.questions,
      dueDate: req.body.dueDate,
      file: req.body.file,
    };

    const upload = await uploadDocs(req, res);

    // console.log(upload);

    // const newAssignment = new Assignment(newData);
    // await newAssignment.save();

    return res.status(200).json({
      message: "Assignment has been created successfully",
      // assignment: newAssignment,
      upload,
    });
  } catch (error) {
    console.log("error creating assignment", error);
    res.status(500).json({ message: "Assignment creation  failed" });
  }
};

export const updateAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    // is the quizz available and not deleted
    const validAssignment = await Assignment.findOne({
      _id: assignmentId,
      deleted: false,
    });

    if (!validAssignment) {
      return res.status(404).json("Assignment not found");
    }

    if (req.user.id !== validAssignment.instructor.toString()) {
      return res
        .status(401)
        .json(
          "Access Denied, you don't have the permission to update this assignment"
        );
    }

    if (!req.body) {
      return res.status(401).json({ message: "No data was provided" });
    }

    const { description, title, file, dueDate } = req.body;

    const AssignmentUpdated = await Assignment.findByIdAndUpdate(
      assignmentId,
      { $set: { title, description, file, dueDate } },
      { new: true }
    );

    return res.status(200).json({
      message: "Assignment has been updated successfully",
      Assignment: AssignmentUpdated,
    });
  } catch (error) {
    console.log("error updating assignment", error);
    res.status(500).json({ message: "Assignment updating failed" });
  }
};

export const getSingleAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    // is the assignment available and not deleted
    const validAssignment = await Assignment.findOne({
      _id: assignmentId,
      deleted: false,
    });
    if (!validAssignment) {
      return res.status(404).json("Assignment not found");
    }

    return res.status(200).json({
      message: "Assignment has been fetched successfully",
      Assignment: validAssignment,
    });
  } catch (error) {
    console.log("error fetching quizz", error);
    res.status(500).json({ message: "Quizz fetching  failed" });
  }
};

export const getAssignmentsByAnInstructor = async (req, res) => {
  try {
    const { instructorId } = req.params;

    if (req.user.id !== instructorId && !req.user.isAdmin) {
      return res
        .status(401)
        .json("Access Denied, you don't have the permission");
    }
    // is the quizz available and not deleted
    const validAssignments = await Assignment.find({
      instructor: instructorId,
      deleted: false,
    });

    if (!validAssignments) {
      return res.status(404).json("Assignments not found");
    }

    return res.status(200).json({
      message: "Assignments has been fetched successfully",
      assignments: validAssignments,
    });
  } catch (error) {
    console.log("error fetching Assignments", error);
    res.status(500).json({ message: "Assignments fetching  failed" });
  }
};

export const getAllAssignments = async (req, res) => {
  try {
    // Valid User

    if (!req.user.isAdmin) {
      return res
        .status(401)
        .json("Access Denied, you don't have the permission");
    }

    // is the quizz available and not deleted
    const validAssignments = await Assignment.find({
      deleted: false,
    });
    if (!validAssignments) {
      return res.status(401).json("Assignments not found");
    }

    return res.status(200).json({
      message: "Assignments has been fetched successfully",
      quizz: validAssignments,
    });
  } catch (error) {
    console.log("error fetching Assignments", error);
    res.status(500).json({ message: "Assignments fetching  failed" });
  }
};

export const deleteSingleAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    // Valid User
    const user = await User.findOne({
      _id: req.user.id,
      deleted: false,
      role: { $in: ["moderator", "instructor"] },
    });

    if (!user) {
      return res
        .status(401)
        .json("Access Denied, you don't have the permission");
    }

    // is the course available and not deleted
    const validAssignment = await Assignment.findOne({
      _id: id,
      deleted: true,
    });

    if (!validAssignment) {
      return res.status(401).json("Assignment does not exist");
    }

    await Assignment.findByIdAndUpdate(id, { deleted: false }, { new: true });
    return res.status(200).json({
      message: "Assignment deleted successfully",
    });
  } catch (error) {
    console.log("error deleting assignment", error);
    res.status(500).json({ message: "Assignment deletion failed" });
  }
};

export const deleteAssignmentByAnInstructor = async (req, res) => {
  try {
    const { instructorId } = req.params;

    if (req.user.id !== instructorId && !req.user.isAdmin) {
      return res
        .status(401)
        .json("Access Denied, you don't have the permission");
    }

    // is the course available and not deleted
    const deleteAssignments = await Assignment.updateMany(
      {
        instructor: instructorId,
        deleted: true,
      },
      { $set: { deleted: false } },
      { new: true }
    );

    if (deleteAssignments.modifiedCount === 0) {
      return res.status(404).json("Assignments do not exist");
    }

    return res.status(200).json({
      message: "Assignments deleted successfully",
    });
  } catch (error) {
    console.log("error deleting Assignments", error);
    res.status(500).json({ message: "Assignments deletion failed" });
  }
};
