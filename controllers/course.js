import Course from "../models/Course.js";
import User from "../models/User.js";
import cloudinary from "../utils/cloudinary.js";

// create Single course
export const createCourse = async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.user.id,
      deleted: false,
      role: "instructor",
    });

    if (!user) {
      return res
        .status(401)
        .json("You don't have the permissions to create a course");
    }
    let uploadedImage = null;
    if (req.file) {
      uploadedImage = await cloudinary.uploader.upload(req.file.path, {
        folder: "courses", // optional folder
      });
    }

    const instructor = user.id;

    const newData = {
      ...req.body,
      image: uploadedImage
        ? {
            url: uploadedImage.secure_url,
            imageName: uploadedImage.public_id,
            caption: req.body?.caption || "",
          }
        : null,
      instructor,
      isSubmitted: true,
    };

    const newCourse = new Course(newData);
    console.log(newCourse);

    user.courses.push(newCourse);

    await newCourse.save();
    await user.save();

    return res.status(200).json({
      message: "course has been created successfully",
      course: newCourse,
    });
  } catch (error) {
    console.log("error creating course", error);
    res.status(500).json({ message: "Course creation  failed" });
  }
};

// Submit Course for Approval
export const submitCourseForApproval = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findOne({ _id: id, deleted: false });
    if (!course) {
      return res.status(401).json({
        message: "such course isn't available",
      });
    }

    console.log(req.user.id, course.instructor);

    if (
      req.user.role !== "instructor" ||
      req.user.id !== course.instructor.toString()
    ) {
      return res.status(401).json({
        message: "You are not authorized",
      });
    }

    if (course.isSubmitted) {
      return res.status(401).json({
        message: "course has been submitted already",
      });
    }

    return res.status(200).json({
      message: "course has been submitted for approval ",
      course: course,
    });
  } catch (error) {
    console.log("error submitting course", error);
    res.status(500).json({ message: "Course Submission  failed" });
  }
};

// get A Course
export const getSingleCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const isItDeleted = await Course.findOne({ _id: id, deleted: true });

    if (isItDeleted) {
      return res.status(401).json({
        message: "course has been deleted",
        isItDeleted,
      });
    }

    const getAcourse = await Course.findById({ _id: id });
    if (!getAcourse) {
      return res.status(401).json({
        message: "such course isn't available",
      });
    }
    return res.status(200).json({
      message: "course has been fecthed successfully",
      course: getAcourse,
    });
  } catch (error) {
    console.log("error fetching course", error);
    res.status(500).json({ message: "Course fecthing  failed" });
  }
};

// Approve A Course
export const approveCourseByModerator = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== "moderator") {
      return res.status(401).json({
        message:
          "Access Denied, you don't have permission to perform this action",
      });
    }

    const course = await Course.findOne({ _id: id, deleted: false });
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    if (course.isApproved) {
      return res
        .status(401)
        .json({ message: "Course has been approved already" });
    }
    course.isApproved = true;
    course.approvedBy = req.user.id;
    course.approvalDate = new Date();
    await course.save();
    return res.status(200).json({
      message: "course has been approved successfully",
      course: course,
    });
  } catch (error) {
    console.log("error approving course", error);
    res.status(500).json({ message: "Course Approving failed" });
  }
};

// publish course
export const publishCourseByInstructor = async (req, res) => {
  try {
    const { id } = req.params;

    const isItDeleted = await Course.findOne({ _id: id, deleted: true });

    if (isItDeleted) {
      return res.status(401).json({
        message: "course has been deleted",
        isItDeleted,
      });
    }

    if (req.user.role !== "instructor") {
      return res.status(401).json({
        message:
          "Access Denied, you don't have permission to perform this action",
      });
    }

    const publishedCourse = await Course.findById({ _id: id });

    publishedCourse.isPublished = !publishedCourse.isPublished;

    if (!publishedCourse) {
      return res.status(404).json({ message: "Course not found" });
    }
    await publishedCourse.save();
    return res.status(200).json({
      message: "course has been published successfully",
      course: publishedCourse,
    });
  } catch (error) {
    console.log("error fetching course", error);
    res.status(500).json({ message: "Course fecthing  failed" });
  }
};

// get All Courses Available
export const getAllCoursesAvailable = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res
        .status(401)
        .json({ message: "Access Denied, you are not allowed" });
    }

    const courses = await Course.find({ deleted: false });
    console.log(courses);

    return res.status(200).json({
      message: "All courses has been fetched successfully",
      courses,
    });
  } catch (error) {
    console.log("error fetching all courses", error);
    return res.status(500).json({ message: "Course fetching  failed" });
  }
};

// get  Courses
export const filterCourses = async (req, res) => {
  try {
    const { category, instructor } = req.query;
    const query = { deleted: false, isPublished: true, isApproved: true };
    if (category) {
      query.category = category;
    }
    if (instructor) {
      query.instructor = instructor;
    }

    const getCourses = await Course.find(query);
    const count = await Course.countDocuments(query);
    return res.status(200).json({
      message: "courses has been fecthed successfully",
      course: getCourses,
      count,
    });
  } catch (error) {
    console.log("error fetching courses", error);
    res.status(500).json({ message: "Courses fetching  failed" });
  }
};

// get all the courses by a single instructor
export const getAllCoursesByAnInstructor = async (req, res) => {
  try {
    const { instructor } = req.params;

    // Is the instructor deleted
    const isTheInstructorDeleted = await User.findOne({
      _id: instructor,
      deleted: true,
      role: "insrtuctor",
    });
    if (isTheInstructorDeleted) {
      return res.status(401).json({
        message: "Instructor has been deleted",
      });
    }

    const courses = await Course.find({
      instructor: instructor,
      deleted: false,
    });

    return res.status(200).json({
      message: "All courses has been fetched successfully",
      courses,
    });
  } catch (error) {
    console.log("error fetching all courses", error);
    res.status(500).json({ message: "Course fetching  failed" });
  }
};

// update a course
export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;

    //has the course been deleted
    const deletedCourse = await Course.findOne({ _id: id, deleted: true });

    if (deletedCourse) {
      return res.status(403).json({
        message: "course has been deleted",
      });
    }
    const existingCourse = await Course.findOne({ _id: id, deleted: false });

    if (!existingCourse) {
      return res.status(404).json("Course not found");
    }

    if (existingCourse?.instructor.toString() !== req.user.id) {
      return res
        .status(401)
        .json("Access Denied, you can only update your course");
    }

    const newData = req.body;
    const updatedCourse = await Course.findByIdAndUpdate(id, newData, {
      new: true,
    });

    return res.status(200).json({
      message: "course updated successfully",
      course: updatedCourse,
    });
  } catch (error) {
    console.log("error updating course", error);
    res.status(500).json({ message: "Updating course failed" });
  }
};

// delete course
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    //has the course been deleted
    const deletedCourse = await Course.findOne({ _id: id, deleted: true });

    if (deletedCourse) {
      return res.status(401).json({
        message: "course has already been deleted",
      });
    }

    const existingCourse = await Course.findOne({ _id: id, deleted: false });

    if (!existingCourse) {
      return res.status(400).json("course not found");
    }
    if (
      req.user.isAdmin === false &&
      existingCourse?.instructor.toString() !== req.user.id
    ) {
      return res
        .status(401)
        .json("Access Denied, you can only delete your course");
    }

    // deleted a course
    await Course.findByIdAndUpdate(
      { _id: id },
      { deleted: true },
      { new: true }
    );

    // remove the course frm enrolled students
    await User.updateMany(
      { enrolledCourses: id },
      { $pull: { enrolledCourses: id } }
    );

    res.status(200).json({
      message: "course account has been deleted successfully",
    });
  } catch (error) {
    console.log("unable to delete course", error);
    res.status(500).json({ message: "Deleting course failed" });
  }
};

export const deleteCoursesByAnInstructor = async (req, res) => {
  try {
    const { instructor } = req.params;

    if (req.user.isAdmin === false && instructor !== req.user.id) {
      return res
        .status(401)
        .json("Access Denied, you can only delete your courses");
    }

    await Course.deleteMany({ instructor: instructor });

    return res.status(200).json({
      message: "courses  has been deleted successfully",
    });
  } catch (error) {
    console.log("unable to delete courses", error);
    res.status(500).json({ message: "Deleting courses failed" });
  }
};
