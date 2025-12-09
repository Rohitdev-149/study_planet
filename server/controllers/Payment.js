const { instance } = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const { mailSender } = require("../utils/mailSender");
const {
  courseEnrollmentEmail,
} = require("../mail/templates/courseEnrollmentEmail");
const mongoose = require("mongoose");

exports.capturePayment = async (req, res) => {
  try {
    // get course id from req body
    const { courseId } = req.body;
    // get user id from req user
    const userId = req.user.id;
    //validation
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course id is required",
      });
    }
    // validate course id
    let course;
    try {
      course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }
      // check if user is already paid for the course
      const uid = new mongoose.Types.ObjectId(userId);
      if (course.studentsEnrolled.includes(uid)) {
        return res.status(400).json({
          success: false,
          message: "User already enrolled in the course",
        });
      }
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid course id",
      });
    }
    // create order on razorpay
    const amount = course.price;
    const currency = "INR";
    const options = {
      amount: amount * 100,
      currency,
      receipt: `receipt_order_${Math.random() * 1000}`,
      notes: {
        courseId: courseId,
        userId: userId,
      },
    };
    try {
      // initialize razorpay order
      const paymentResponse = await instance.orders.create(options);
      console.log(paymentResponse);
      return res.status(200).json({
        success: true,
        message: "Order created successfully",
        data: order,
        courseName: course.courseName,
        courseDescription: course.courseDescription,
        thumbnail: course.thumbnail,
        orderId: paymentResponse.id,
        amount: paymentResponse.amount,
        currency: paymentResponse.currency,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: "Could not initiate order",
        error: error.message,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Could not process payment",
      error: error.message,
    });
  }
};
// verify payment signature
exports.verifySignature = async (req, res) => {
  const webHookSecret = process.env.RAZORPAY_WEBHOOK_SECRET; // present in BE
  const signature = req.headers["x-razorpay-signature"]; // from razorpay
  const payload = JSON.stringify(req.body);
  const crypto = require("crypto");
  const expectedSignature = crypto
    .createHmac("sha256", webHookSecret)
    .update(payload)
    .digest("hex");

  if (signature === expectedSignature) {
    console.log("Payment is Authorized");
    const { courseId, userId } = req.body.payload.payment.entity.notes;
    try {
      // enroll the user in the course
      const enrolledCourse = await Course.findByIdAndUpdate(
        { _id: courseId },
        { $push: { studentsEnrolled: userId } },
        { new: true }
      );
      if (!enrolledCourse) {
        return res.status(500).json({
          success: false,
          message: "Course not found",
        });
      }
      console.log(enrolledCourse);
      // update the user's in course list
      const enrolledUser = await User.findByIdAndUpdate(
        { _id: userId },
        { $push: { courses: courseId } },
        { new: true }
      );
      console.log(enrolledUser);
      // send confirmation email to the user
      const email = enrolledUser.email;
      const name = enrolledUser.name;
      const courseName = enrolledCourse.courseName;
      const courseDescription = enrolledCourse.courseDescription;
      const thumbnail = enrolledCourse.thumbnail;
      await mailSender(
        email,
        "Congratulations on enrolling in a new course!",
        courseEnrollmentEmail(name, courseName, courseDescription, thumbnail)
      );
      return res.status(200).json({
        success: true,
        message: "User enrolled in the course successfully",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: "Unable to enroll user in the course",
        error: error.message,
      });
    }
  } else {
    return res.status(400).json({
      success: false,
      message: "Invalid signature",
    });
  }
};
