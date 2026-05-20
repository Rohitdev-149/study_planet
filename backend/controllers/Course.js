const Course = require("../models/Course");
const Category = require("../models/Category");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const User = require("../models/User");
const { populate } = require("dotenv");
//create course handler function
exports.createCourse = async (req, res) => {
  try {
    // fetch data from request body
    const { courseName, courseDescription, whatYouWillLearn, price, tags } =
      req.body;
    // get thumbnail image from req files
    const thumbnail = req.files.thumbnailImage;
    // validation
    if (
      !courseName ||
      !courseDescription ||
      !whatYouwillLearn ||
      !price ||
      !tags
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    // check if user is an instructor
    const userId = req.user.id;
    const userDetails = await User.findById(userId);
    console.log("userDetail", userDetails);

    if (userDetails.accountType !== "Instructor") {
      return res.status(403).json({
        success: false,
        message: "Only instructors are allowed to create course",
      });
    }
    // check if category exists
    const categoryDetails = await Category.findById(tags);
    if (!categoryDetails) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
        error: `Category with ID ${tags} does not exist`,
      });
    }
    // upload thumbnail to cloudinary
    const thumbnailImage = await uploadImageToCloudinary(
      thumbnail,
      process.env.COURSE_THUMBNAIL_FOLDER
    );
    // create course entry in database
    const newCourse = await Course.create({
      courseName,
      courseDescription,
      whatYouWillLearn,
      price,
      category: categoryDetails._id, // Changed from tags to category to match schema
      thumbnailImage: thumbnailImage.secure_url,
      instructor: userDetails._id,
    });
    // add to courses array of user (instructor)
    await User.findByIdAndUpdate(
      { _id: userDetails._id },
      { $push: { courses: newCourse._id } },
      { new: true }
    );
    // update category schema with this course
    await Category.findByIdAndUpdate(
      { _id: categoryDetails._id },
      { $push: { courses: newCourse._id } },
      { new: true }
    );
    // return response
    return res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: newCourse,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error in creating course",
      error: error.message,
    });
  }
};
// get all courses
exports.getAllCourses = async (req, res) => {
  try {
    const allCourses = await Course.find(
      {},
      {
        courseName: 1,
        price: 1,
        ratingsAndReviews: 1,
        thumbnailImage: 1,
        studentsEnrolled: 1,
        instructor: 1,
      }
    ).populate("instructor");
    return res.status(200).json({
      success: true,
      message: "All courses fetched successfully",
      data: allCourses,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error in fetching courses",
      error: error.message,
    });
  }
};
// get course details by id
exports.getCourseDetails = async (req, res) => {
  try {
    // get id from params
    const { courseId } = req.params;
    // find course detail
    const courseDetails = await Course.findById(courseId)
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingsAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();
    // validation
    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: `Course not found with ID: ${courseId}`,
      });
    }
    // return response
    return res.status(200).json({
      success: true,
      message: "Course detail found successfully",
      data: courseDetails,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
