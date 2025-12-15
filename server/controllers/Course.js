const Course = require("../models/Course");
const Category = require("../models/Category");
const Section = require("../models/Section");
const SubSection = require("../models/SubSection");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const CourseProgress = require("../models/CourseProgress");
const { convertSecondsToDuration } = require("../utils/secToDuration");
// Function to create a new course
exports.createCourse = async (req, res) => {
  try {
    // Get user ID from request object
    const userId = req.user.id;

    // Get all required fields from request body
    let {
      courseName,
      courseDescription,
      whatYouWillLearn,
      price,
      tag: _tag,
      category,
      status,
      instructions: _instructions,
    } = req.body;
    // Get thumbnail image from request files
    const thumbnail = req.files?.thumbnailImage;

    // Validate basic required fields first (check for empty strings too)
    // Ensure fields are strings before calling trim
    if (
      !courseName ||
      typeof courseName !== "string" ||
      !courseName.trim() ||
      !courseDescription ||
      typeof courseDescription !== "string" ||
      !courseDescription.trim() ||
      !whatYouWillLearn ||
      typeof whatYouWillLearn !== "string" ||
      !whatYouWillLearn.trim() ||
      !category
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Course name, description, benefits, and category are required and cannot be empty",
      });
    }

    // Validate price
    if (!price || price === undefined || price === null) {
      return res.status(400).json({
        success: false,
        message: "Course price is required",
      });
    }

    // Convert price to number and validate
    price = parseFloat(price);
    if (isNaN(price) || price < 0) {
      return res.status(400).json({
        success: false,
        message:
          "Price must be a valid number (0 or greater). Use 0 for free courses.",
      });
    }
    // Allow price = 0 for free courses

    // Validate thumbnail
    if (!thumbnail) {
      return res.status(400).json({
        success: false,
        message: "Course thumbnail image is required",
      });
    }

    // Additional thumbnail validation
    if (!thumbnail.tempFilePath && !thumbnail.data && !thumbnail.mv) {
      console.error("Invalid thumbnail file object:", thumbnail);
      return res.status(400).json({
        success: false,
        message: "Invalid image file format",
      });
    }

    // Convert the tag and instructions from stringified Array to Array
    let tag = [];
    let instructions = [];

    try {
      // Validate and parse tag
      if (!_tag) {
        return res.status(400).json({
          success: false,
          message: "Tags field is required",
        });
      }

      // Check if _tag is already an array (shouldn't happen, but handle it)
      if (Array.isArray(_tag)) {
        tag = _tag;
      } else if (typeof _tag === "string") {
        // Try to parse the JSON string
        tag = JSON.parse(_tag);

        // Validate that parsed result is an array
        if (!Array.isArray(tag)) {
          return res.status(400).json({
            success: false,
            message: "Tags must be an array",
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          message: "Invalid tags format",
        });
      }

      // Validate tags array is not empty
      if (tag.length === 0) {
        return res.status(400).json({
          success: false,
          message: "At least one tag is required",
        });
      }

      // Validate and parse instructions
      if (!_instructions) {
        return res.status(400).json({
          success: false,
          message: "Instructions/Requirements field is required",
        });
      }

      if (Array.isArray(_instructions)) {
        instructions = _instructions;
      } else if (typeof _instructions === "string") {
        instructions = JSON.parse(_instructions);

        if (!Array.isArray(instructions)) {
          return res.status(400).json({
            success: false,
            message: "Instructions must be an array",
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          message: "Invalid instructions format",
        });
      }

      // Validate instructions array is not empty
      if (instructions.length === 0) {
        return res.status(400).json({
          success: false,
          message: "At least one requirement/instruction is required",
        });
      }
    } catch (parseError) {
      console.error("Error parsing tag or instructions:", parseError);
      return res.status(400).json({
        success: false,
        message: `Invalid JSON format: ${parseError.message}`,
      });
    }

    // Set default status
    if (!status || status === undefined) {
      status = "Draft";
    }

    // Validate status value
    if (status !== "Draft" && status !== "Published") {
      return res.status(400).json({
        success: false,
        message: "Status must be either 'Draft' or 'Published'",
      });
    }
    // Check if the user is an instructor
    const instructorDetails = await User.findById(userId);
    if (!instructorDetails) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (instructorDetails.accountType !== "Instructor") {
      return res.status(403).json({
        success: false,
        message: "Only instructors can create courses",
      });
    }

    // Check if the category exists
    const categoryDetails = await Category.findById(category);
    if (!categoryDetails) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Upload the Thumbnail to Cloudinary
    let thumbnailImage;
    try {
      // Check if Cloudinary is configured (support both naming conventions)
      const cloudName =
        process.env.CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
      const apiKey = process.env.API_KEY || process.env.CLOUDINARY_API_KEY;
      const apiSecret =
        process.env.API_SECRET || process.env.CLOUDINARY_API_SECRET;

      if (!cloudName || !apiKey || !apiSecret) {
        return res.status(500).json({
          success: false,
          message:
            "Image upload service is not configured. Please set Cloudinary credentials (CLOUD_NAME/CLOUDINARY_CLOUD_NAME, API_KEY/CLOUDINARY_API_KEY, API_SECRET/CLOUDINARY_API_SECRET) in your .env file.",
        });
      }

      // Check if FOLDER_NAME is set
      const folderName = process.env.FOLDER_NAME || "StudyPlanet";

      thumbnailImage = await uploadImageToCloudinary(thumbnail, folderName);

      if (!thumbnailImage || !thumbnailImage.secure_url) {
        return res.status(500).json({
          success: false,
          message: "Failed to upload thumbnail image",
        });
      }
    } catch (uploadError) {
      console.error("Error uploading thumbnail:", uploadError);
      return res.status(500).json({
        success: false,
        message: `Failed to upload thumbnail: ${uploadError.message}`,
      });
    }

    // Create a new course with the given details
    let newCourse;
    try {
      newCourse = await Course.create({
        courseName: courseName.trim(),
        courseDescription: courseDescription.trim(),
        instructor: instructorDetails._id,
        whatYouWillLearn: whatYouWillLearn.trim(),
        price,
        tag,
        category: categoryDetails._id,
        thumbnail: thumbnailImage.secure_url,
        status: status,
        instructions,
      });
    } catch (courseError) {
      console.error("Error creating course:", courseError);
      return res.status(500).json({
        success: false,
        message: "Failed to create course in database",
        error: courseError.message,
      });
    }

    // Add the new course to the User Schema of the Instructor
    try {
      await User.findByIdAndUpdate(
        instructorDetails._id,
        {
          $push: {
            courses: newCourse._id,
          },
        },
        { new: true }
      );
    } catch (userUpdateError) {
      console.error("Error updating instructor courses:", userUpdateError);
      // Course is created, but instructor update failed - log but don't fail
      // Optionally, you could rollback course creation here
    }

    // Add the new course to the Category
    try {
      await Category.findByIdAndUpdate(
        categoryDetails._id,
        {
          $push: {
            courses: newCourse._id,
          },
        },
        { new: true }
      );
    } catch (categoryUpdateError) {
      console.error("Error updating category courses:", categoryUpdateError);
      // Course is created, but category update failed - log but don't fail
    }

    // Return the new course and a success message
    res.status(200).json({
      success: true,
      data: newCourse,
      message: "Course Created Successfully",
    });
  } catch (error) {
    // Handle any unexpected errors that occur during the creation of the course
    console.error("Unexpected error in createCourse:", error);
    console.error("Error stack:", error.stack);
    console.error("Request body:", req.body);
    console.error("Request files:", req.files);
    res.status(500).json({
      success: false,
      message: "Failed to create course",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};
// Edit Course Details
exports.editCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const instructorId = req.user.id;
    const updates = req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: "Course not found",
      });
    }

    // Verify that the course belongs to the instructor trying to edit it
    if (course.instructor.toString() !== instructorId.toString()) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to edit this course. Only the course instructor can edit it.",
      });
    }

    // If Thumbnail Image is found, update it
    if (req.files && req.files.thumbnailImage) {
      try {
        // Check if Cloudinary is configured (support both naming conventions)
        const cloudName =
          process.env.CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
        const apiKey = process.env.API_KEY || process.env.CLOUDINARY_API_KEY;
        const apiSecret =
          process.env.API_SECRET || process.env.CLOUDINARY_API_SECRET;

        if (!cloudName || !apiKey || !apiSecret) {
          return res.status(500).json({
            success: false,
            message:
              "Image upload service is not configured. Please set Cloudinary credentials in your .env file.",
          });
        }

        console.log("thumbnail update");
        const thumbnail = req.files.thumbnailImage;
        const folderName = process.env.FOLDER_NAME || "StudyPlanet";
        const thumbnailImage = await uploadImageToCloudinary(
          thumbnail,
          folderName
        );

        if (!thumbnailImage || !thumbnailImage.secure_url) {
          return res.status(500).json({
            success: false,
            message: "Failed to upload thumbnail image",
          });
        }

        course.thumbnail = thumbnailImage.secure_url;
      } catch (uploadError) {
        console.error("Error uploading thumbnail:", uploadError);
        return res.status(500).json({
          success: false,
          message: `Failed to upload thumbnail: ${uploadError.message}`,
        });
      }
    }

    // Update only the fields that are present in the request body
    for (const key in updates) {
      if (updates.hasOwnProperty(key)) {
        if (key === "tag" || key === "instructions") {
          course[key] = JSON.parse(updates[key]);
        } else {
          course[key] = updates[key];
        }
      }
    }

    await course.save();

    const updatedCourse = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();

    res.json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
// Get Course List
exports.getAllCourses = async (req, res) => {
  try {
    const allCourses = await Course.find(
      { status: "Published" },
      {
        courseName: true,
        price: true,
        thumbnail: true,
        instructor: true,
        ratingAndReviews: true,
        studentsEnrolled: true,
      }
    )
      .populate("instructor")
      .exec();

    return res.status(200).json({
      success: true,
      data: allCourses,
    });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      success: false,
      message: `Can't Fetch Course Data`,
      error: error.message,
    });
  }
};
// Get One Single Course Details
// exports.getCourseDetails = async (req, res) => {
//   try {
//     const { courseId } = req.body
//     const courseDetails = await Course.findOne({
//       _id: courseId,
//     })
//       .populate({
//         path: "instructor",
//         populate: {
//           path: "additionalDetails",
//         },
//       })
//       .populate("category")
//       .populate("ratingAndReviews")
//       .populate({
//         path: "courseContent",
//         populate: {
//           path: "subSection",
//         },
//       })
//       .exec()
//     // console.log(
//     //   "###################################### course details : ",
//     //   courseDetails,
//     //   courseId
//     // );
//     if (!courseDetails || !courseDetails.length) {
//       return res.status(400).json({
//         success: false,
//         message: `Could not find course with id: ${courseId}`,
//       })
//     }

//     if (courseDetails.status === "Draft") {
//       return res.status(403).json({
//         success: false,
//         message: `Accessing a draft course is forbidden`,
//       })
//     }

//     return res.status(200).json({
//       success: true,
//       data: courseDetails,
//     })
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     })
//   }
// }
exports.getCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body;
    const courseDetails = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
          select: "-videoUrl",
        },
      })
      .exec();

    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find course with id: ${courseId}`,
      });
    }

    // if (courseDetails.status === "Draft") {
    //   return res.status(403).json({
    //     success: false,
    //     message: `Accessing a draft course is forbidden`,
    //   });
    // }

    let totalDurationInSeconds = 0;
    courseDetails.courseContent.forEach((content) => {
      content.subSection.forEach((subSection) => {
        const timeDurationInSeconds = parseInt(subSection.timeDuration);
        totalDurationInSeconds += timeDurationInSeconds;
      });
    });

    const totalDuration = convertSecondsToDuration(totalDurationInSeconds);

    return res.status(200).json({
      success: true,
      data: {
        courseDetails,
        totalDuration,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.getFullCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;
    const courseDetails = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();

    let courseProgressCount = await CourseProgress.findOne({
      courseID: courseId,
      userId: userId,
    });

    console.log("courseProgressCount : ", courseProgressCount);

    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find course with id: ${courseId}`,
      });
    }

    // if (courseDetails.status === "Draft") {
    //   return res.status(403).json({
    //     success: false,
    //     message: `Accessing a draft course is forbidden`,
    //   });
    // }

    let totalDurationInSeconds = 0;
    courseDetails.courseContent.forEach((content) => {
      content.subSection.forEach((subSection) => {
        const timeDurationInSeconds = parseInt(subSection.timeDuration);
        totalDurationInSeconds += timeDurationInSeconds;
      });
    });

    const totalDuration = convertSecondsToDuration(totalDurationInSeconds);

    return res.status(200).json({
      success: true,
      data: {
        courseDetails,
        totalDuration,
        completedVideos: courseProgressCount?.completedVideos
          ? courseProgressCount?.completedVideos
          : [],
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get a list of Course for a given Instructor
exports.getInstructorCourses = async (req, res) => {
  try {
    // Get the instructor ID from the authenticated user or request body
    const instructorId = req.user.id;

    // Find all courses belonging to the instructor
    const instructorCourses = await Course.find({
      instructor: instructorId,
    }).sort({ createdAt: -1 });

    // Return the instructor's courses
    res.status(200).json({
      success: true,
      data: instructorCourses,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve instructor courses",
      error: error.message,
    });
  }
};
// Delete the Course
exports.deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const instructorId = req.user.id;

    // Validate courseId
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      });
    }

    // Find the course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Verify that the course belongs to the instructor trying to delete it
    if (course.instructor.toString() !== instructorId.toString()) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to delete this course. Only the course instructor can delete it.",
      });
    }

    // Unenroll students from the course
    const studentsEnrolled = course.studentsEnroled;
    for (const studentId of studentsEnrolled) {
      await User.findByIdAndUpdate(studentId, {
        $pull: { courses: courseId },
      });
    }

    // Delete sections and sub-sections
    const courseSections = course.courseContent;
    for (const sectionId of courseSections) {
      // Delete sub-sections of the section
      const section = await Section.findById(sectionId);
      if (section) {
        const subSections = section.subSection;
        for (const subSectionId of subSections) {
          await SubSection.findByIdAndDelete(subSectionId);
        }
      }

      // Delete the section
      await Section.findByIdAndDelete(sectionId);
    }

    // Delete the course
    await Course.findByIdAndDelete(courseId);

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
