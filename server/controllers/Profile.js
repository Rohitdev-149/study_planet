const Profile = require("../models/Profile");
const User = require("../models/User");
const Course = require("../models/Course");

// update profile controller
exports.updateProfile = async (req, res) => {
  try {
    // fetch data from request body
    const { dateOfBirth = "", about = "", contactNumber, gender } = req.body;
    console.log("updateProfile -> req.body:", req.body);
    console.log("updateProfile -> req.user:", req.user);
    // get user id from req user
    const userId = req.user?.id;
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication failed" });
    }
    // validation
    if (!contactNumber || !gender) {
      return res.status(400).json({
        success: false,
        message: "Contact number and gender are required",
      });
    }
    // find user & profile
    const userDetails = await User.findById(userId);
    console.log("updateProfile -> userDetails:", userDetails);
    if (!userDetails) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    let profileId = userDetails.additionalDetails;
    console.log("updateProfile -> profileId:", profileId);
    if (!profileId) {
      console.log("updateProfile -> no profile found; creating a new profile");
      const newProfile = await Profile.create({
        gender: null,
        dateOfBirth: null,
        about: null,
        contactNumber: null,
      });
      profileId = newProfile._id;
      userDetails.additionalDetails = profileId;
      await userDetails.save();
      console.log("updateProfile -> created newProfileId:", profileId);
    }
    let profileDetails = await Profile.findById(profileId);
    console.log(
      "updateProfile -> profileDetails after DB fetch:",
      profileDetails
    );
    if (!profileDetails) {
      console.log(
        "updateProfile -> profileId found but profileDetails missing; creating new profile"
      );
      const newProfile = await Profile.create({
        gender: null,
        dateOfBirth: null,
        about: null,
        contactNumber: null,
      });
      profileId = newProfile._id;
      userDetails.additionalDetails = profileId;
      await userDetails.save();
      profileDetails = newProfile;
      console.log(
        "updateProfile -> Created new profile details:",
        profileDetails
      );
    }
    console.log("updateProfile -> profileDetails:", profileDetails);
    // update profile
    profileDetails.dateOfBirth = dateOfBirth;
    profileDetails.about = about;
    profileDetails.contactNumber = contactNumber;
    profileDetails.gender = gender;
    await profileDetails.save();

    // return the updated user object so frontend can sync profile state
    const updatedUserDetails = await User.findById(userId).populate(
      "additionalDetails"
    );
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      updatedUserDetails: updatedUserDetails,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error in updating profile",
      error: error.message,
    });
  }
};
// delete account (profile + user) controller - only for students
exports.deleteAccount = async (req, res) => {
  try {
    // fetch user id from req user
    const id = req.user.id;
    // find user
    const userDetails = await User.findById(id);
    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user is a student
    if (userDetails.accountType !== "Student") {
      return res.status(403).json({
        success: false,
        message: "Only students are allowed to delete their accounts",
      });
    }
    //delete profile
    await Profile.findByIdAndDelete({ _id: userDetails.additionalDetails });
    // delete user account
    await User.findByIdAndDelete({ _id: id });
    // unenroll user from all courses
    const enrolledCourses = userDetails.courses;
    for (const courseId of enrolledCourses) {
      const course = await Course.findById(courseId);
      if (course) {
        course.studentsEnrolled.pull(userDetails._id);
        await course.save();
      }
    }

    // response
    return res.status(200).json({
      success: true,
      message: "Profile and user account deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error in deleting profile",
      error: error.message,
    });
  }
};
// get all user details controller
exports.getUserDetails = async (req, res) => {
  try {
    // fetch user id from req user
    const id = req.user.id;
    // find user
    const userDetails = await User.findById(id)
      .populate("additionalDetails")
      .populate("courses");
    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "User details fetched successfully",
      data: userDetails,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error in fetching user details",
      error: error.message,
    });
  }
};

// Expose the name expected by routes
exports.getAllUserDetails = exports.getUserDetails;

// update display picture
exports.updateDisplayPicture = async (req, res) => {
  try {
    // 1. Validate auth and user
    console.log("Auth user object:", req.user);
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        debug: { user: req.user },
      });
    }
    const userId = req.user.id;

    // 2. Log request details for debugging
    console.log("Request details:", {
      userId,
      headers: req.headers,
      filesExist: !!req.files,
      fileKeys: req.files ? Object.keys(req.files) : [],
    });

    if (!req.files) {
      return res.status(400).json({
        success: false,
        message: "No files were uploaded",
        debug: { files: req.files },
      });
    }

    if (!req.files.displayPicture) {
      return res.status(400).json({
        success: false,
        message: "Please upload an image with field name 'displayPicture'",
        debug: { availableFiles: Object.keys(req.files) },
      });
    }

    const displayPicture = req.files.displayPicture;

    // Validate file type
    if (!displayPicture.mimetype.startsWith("image/")) {
      return res.status(400).json({
        success: false,
        message: "Please upload an image file",
        debug: { fileType: displayPicture.mimetype },
      });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    try {
      // Upload to Cloudinary
      const { uploadImageToCloudinary } = require("../utils/imageUploader");
      const result = await uploadImageToCloudinary(
        displayPicture,
        "profile_pictures",
        250,
        80
      );

      if (!result || !result.secure_url) {
        return res.status(400).json({
          success: false,
          message: "Error uploading to Cloudinary",
          error: "No secure URL received",
        });
      }

      // Store old image URL for cleanup
      const oldImageUrl = user.image;

      // Update user profile
      user.image = result.secure_url;
      await user.save();

      // Could add Cloudinary cleanup of old image here if needed
      // await cloudinary.uploader.destroy(oldImagePublicId);

      return res.status(200).json({
        success: true,
        message: "Display picture updated successfully",
        data: user,
      });
    } catch (uploadError) {
      console.error("Cloudinary upload error:", uploadError);
      return res.status(400).json({
        success: false,
        message: "Error uploading image to Cloudinary",
        error: uploadError.message,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error updating display picture",
      error: error.message,
    });
  }
};

// get enrolled courses for a user
exports.getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate("courses");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    return res.status(200).json({
      success: true,
      message: "Enrolled courses fetched",
      data: user.courses,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error fetching enrolled courses",
      error: error.message,
    });
  }
};
