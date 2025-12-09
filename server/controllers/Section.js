const Section = require("../models/Section");
const Course = require("../models/Course");
const mongoose = require("mongoose");

// Input validation helper
const validateInput = (data, requiredFields) => {
  const errors = [];

  requiredFields.forEach((field) => {
    if (
      !data[field] ||
      (typeof data[field] === "string" && data[field].trim() === "")
    ) {
      errors.push(`${field} is required`);
    }
  });

  return errors;
};

// Validate ObjectId format
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// create section controller
exports.createSection = async (req, res) => {
  try {
    // fetch data from request body
    const { sectionName, courseId } = req.body;

    // Input validation
    const validationErrors = validateInput({ sectionName, courseId }, [
      "sectionName",
      "courseId",
    ]);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    // Additional validation for section name
    const trimmedSectionName = sectionName.trim();
    if (trimmedSectionName.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Section name must be less than 100 characters",
      });
    }

    if (trimmedSectionName.length < 3) {
      return res.status(400).json({
        success: false,
        message: "Section name must be at least 3 characters long",
      });
    }

    // Validate ObjectId format
    if (!isValidObjectId(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID format",
      });
    }

    // Check if course exists and user is the instructor
    const courseExists = await Course.findById(courseId).populate("instructor");
    if (!courseExists) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if the current user is the instructor of this course
    if (courseExists.instructor._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message:
          "Access denied. You can only add sections to your own courses.",
      });
    }

    // Check if section name already exists in this course
    const existingSection = await Section.findOne({
      sectionName: trimmedSectionName,
      _id: { $in: courseExists.courseContent },
    });

    if (existingSection) {
      return res.status(409).json({
        success: false,
        message: "A section with this name already exists in this course",
      });
    }

    // Create section
    const newSection = await Section.create({
      sectionName: trimmedSectionName,
    });

    // Update course with this section
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      { $push: { courseContent: newSection._id } },
      { new: true }
    ).populate({
      path: "courseContent",
      select: "sectionName createdAt",
    });

    return res.status(201).json({
      success: true,
      message: "Section created successfully",
      data: {
        section: newSection,
        course: {
          id: updatedCourse._id,
          courseName: updatedCourse.courseName,
          totalSections: updatedCourse.courseContent.length,
        },
      },
    });
  } catch (error) {
    console.error("Error in createSection:", error);
    return res.status(500).json({
      success: false,
      message: "Error in creating section",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// update section controller
exports.updateSection = async (req, res) => {
  try {
    // fetch data from request body
    const { sectionName, sectionId } = req.body;

    // Input validation
    const validationErrors = validateInput({ sectionName, sectionId }, [
      "sectionName",
      "sectionId",
    ]);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    // Additional validation for section name
    const trimmedSectionName = sectionName.trim();
    if (trimmedSectionName.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Section name must be less than 100 characters",
      });
    }

    if (trimmedSectionName.length < 3) {
      return res.status(400).json({
        success: false,
        message: "Section name must be at least 3 characters long",
      });
    }

    // Validate ObjectId format
    if (!isValidObjectId(sectionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid section ID format",
      });
    }

    // Check if section exists
    const existingSection = await Section.findById(sectionId);
    if (!existingSection) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      });
    }

    // Find the course that contains this section to check ownership
    const courseWithSection = await Course.findOne({
      courseContent: sectionId,
    }).populate("instructor");

    if (!courseWithSection) {
      return res.status(404).json({
        success: false,
        message: "Course containing this section not found",
      });
    }

    // Check if the current user is the instructor of this course
    if (courseWithSection.instructor._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message:
          "Access denied. You can only update sections in your own courses.",
      });
    }

    // Check if the new section name already exists in this course (excluding current section)
    const duplicateSection = await Section.findOne({
      sectionName: trimmedSectionName,
      _id: { $ne: sectionId, $in: courseWithSection.courseContent },
    });

    if (duplicateSection) {
      return res.status(409).json({
        success: false,
        message: "A section with this name already exists in this course",
      });
    }

    // Update section
    const updatedSection = await Section.findByIdAndUpdate(
      sectionId,
      {
        sectionName: trimmedSectionName,
        updatedAt: new Date(),
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Section updated successfully",
      data: {
        section: updatedSection,
        course: {
          id: courseWithSection._id,
          courseName: courseWithSection.courseName,
        },
      },
    });
  } catch (error) {
    console.error("Error in updateSection:", error);
    return res.status(500).json({
      success: false,
      message: "Error in updating section",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// delete section controller
exports.deleteSection = async (req, res) => {
  try {
    // fetch sectionId from request params
    const { sectionId } = req.params;

    // validation
    if (!sectionId) {
      return res.status(400).json({
        success: false,
        message: "Section ID is required",
      });
    }

    // Validate ObjectId format
    if (!isValidObjectId(sectionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid section ID format",
      });
    }

    // Check if section exists
    const existingSection = await Section.findById(sectionId);
    if (!existingSection) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      });
    }

    // Find the course that contains this section to check ownership
    const courseWithSection = await Course.findOne({
      courseContent: sectionId,
    }).populate("instructor");

    if (!courseWithSection) {
      return res.status(404).json({
        success: false,
        message: "Course containing this section not found",
      });
    }

    // Check if the current user is the instructor of this course
    if (courseWithSection.instructor._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message:
          "Access denied. You can only delete sections from your own courses.",
      });
    }

    // Check if section has subsections
    if (existingSection.subSection && existingSection.subSection.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete section with subsections. Please delete all subsections first.",
        subsectionsCount: existingSection.subSection.length,
      });
    }

    // Delete section from database
    await Section.findByIdAndDelete(sectionId);

    // Remove section from course's courseContent array
    const updatedCourse = await Course.findByIdAndUpdate(
      courseWithSection._id,
      { $pull: { courseContent: sectionId } },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Section deleted successfully",
      data: {
        deletedSection: {
          id: sectionId,
          sectionName: existingSection.sectionName,
        },
        course: {
          id: updatedCourse._id,
          courseName: updatedCourse.courseName,
          remainingSections: updatedCourse.courseContent.length,
        },
      },
    });
  } catch (error) {
    console.error("Error in deleteSection:", error);
    return res.status(500).json({
      success: false,
      message: "Error in deleting section",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};
