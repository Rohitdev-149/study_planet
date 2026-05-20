const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");
const mongoose = require("mongoose");
// create rating and review for a course
exports.createRatingAndReview = async (req, res) => {
  try {
    // get user id from req user
    const userId = req.user.id;
    // fetch data from req body
    const { courseId, rating, review } = req.body;
    // check user is enrolled in the course or not
    const courseDetails = await Course.findOne({
      _id: courseId,
      studentsEnrolled: { $in: [userId] },
    });
    if (!courseDetails) {
      return res.status(403).json({
        success: false,
        message: "User is not enrolled in the course",
      });
    }
    // check the user has already given review or not
    const alreadyReviewed = await RatingAndReview.findOne({
      course: courseId,
      user: userId,
    });
    if (alreadyReviewed) {
      return res.status(403).json({
        success: false,
        message: "User has already given review for this course",
      });
    }
    // create rating and review
    const newRatingAndReview = await RatingAndReview.create({
      course: courseId,
      user: userId,
      rating,
      review,
    });
    // add rating and review to course model
    await Course.findByIdAndUpdate(
      { _id: courseId },
      { $push: { ratingsAndReviews: newRatingAndReview._id } },
      { new: true }
    );
    return res.status(200).json({
      success: true,
      message: "Rating and review created successfully",
      data: newRatingAndReview,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error in creating rating and review",
      error: error.message,
    });
  }
};

// get average rating for a course
exports.getAverageRating = async (req, res) => {
  try {
    // get course id from req params
    const courseId = req.params.courseId;
    // fetch average rating for the course
    const result = await RatingAndReview.aggregate([
      {
        $match: { course: new mongoose.Types.ObjectId(courseId) },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
        },
      },
    ]);
    let averageRating = 0;
    if (result.length > 0) {
      averageRating = result[0].averageRating;
    }
    return res.status(200).json({
      success: true,
      message: "Average rating fetched successfully",
      data: { averageRating },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error in fetching average rating",
      error: error.message,
    });
  }
};

// get all ratings and reviews for a course
exports.getAllRatingsAndReviews = async (req, res) => {
  try {
    // get course id from req params
    const courseId = req.params.courseId;
    // fetch all ratings and reviews for the course
    const allRatingsAndReviews = await RatingAndReview.find({
      course: courseId,
    }).populate({ path: "user", select: "firstName lastName email" });
    return res.status(200).json({
      success: true,
      message: "All ratings and reviews fetched successfully",
      data: allRatingsAndReviews,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error in fetching ratings and reviews",
      error: error.message,
    });
  }
};
