const Category = require("../models/Category");
const Course = require("../models/Course");

// createCategory handler
exports.createCategory = async (req, res) => {
  try {
    // Extract name and description from request body
    const { name, description } = req.body;

    // Validate input
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    // Create category
    const categoryDetails = await Category.create({
      name: name,
      description: description,
    });

    return res.status(200).json({
      success: true,
      message: "Category created successfully",
      data: categoryDetails,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error in creating category",
      error: error.message,
    });
  }
};

// getAllCategories handler
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find(
      {},
      { name: true, description: true }
    );
    res.status(200).json({
      success: true,
      message: "All categories retrieved successfully",
      data: categories,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error in getting categories",
      error: error.message,
    });
  }
};

// Get category page details
exports.categoryPageDetails = async (req, res) => {
  try {
    const { categoryId } = req.params;

    // Get courses for the specified category
    const selectedCategory = await Category.findById(categoryId)
      .populate({
        path: "courses",
        select: "courseName description instructor rating price thumbnail",
        populate: {
          path: "instructor",
          select: "firstName lastName",
        },
      })
      .exec();

    if (!selectedCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Get courses from other categories
    const otherCategories = await Category.find({
      _id: { $ne: categoryId },
    }).populate({
      path: "courses",
      select: "courseName description instructor rating price thumbnail",
      populate: {
        path: "instructor",
        select: "firstName lastName",
      },
    });

    // Get top-selling courses
    const topSellingCourses = await Course.find()
      .sort({ studentsEnrolled: -1 })
      .limit(10)
      .populate({
        path: "instructor",
        select: "firstName lastName",
      })
      .select("courseName description rating price thumbnail");

    return res.status(200).json({
      success: true,
      data: {
        selectedCategory,
        otherCategories,
        topSellingCourses,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error in getting categories",
      error: error.message,
    });
  }
};

