const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const catchAsync = require("../utils/catchAsync");
const { BadRequestError, NotFoundError } = require("../utils/customErrors");

// create subsection controller
exports.createSubSection = catchAsync(async (req, res, next) => {
    // fetch data from request body
    const { sectionId, title, description, timeDuration } = req.body;
    
    // Extract video file from uploaded files
    const videoFile = req.files ? req.files.videoFile : null;

    // validation
    if (!title || !sectionId || !description || !timeDuration || !videoFile) {
        throw new BadRequestError("All fields are required (including videoFile)");
    }
    
    // check if parent section exists
    const parentSection = await Section.findById(sectionId);
    if (!parentSection) {
        throw new NotFoundError("Parent Section not found");
    }

    //upload video to cloudinary
    const uploadDetails = await uploadImageToCloudinary(
        videoFile,
        process.env.COURSE_THUMBNAIL_FOLDER
    );

    // create subsection
    const SubSectionDetail = await SubSection.create({
        title,
        description, 
        timeDuration,
        videoUrl: uploadDetails.secure_url,
    });

    // update section with this subsection object id
    const UpdatedSection = await Section.findByIdAndUpdate(
      sectionId,
      { $push: { subSection: SubSectionDetail._id } },
      { new: true }
    ).populate("subSection");

    return res.status(200).json({
      success: true,
      message: "SubSection created successfully",
      data: UpdatedSection,
    });
});

// update subsection controller
exports.updateSubSection = catchAsync(async (req, res, next) => {
    // fetch data from request body
    const { subSectionId, title, description, timeDuration } = req.body;
    const videoFile = req.files ? req.files.videoFile : null;

    // validation
    if (!subSectionId) {
        throw new BadRequestError("SubSection ID is required");
    }

    const subSectionToUpdate = await SubSection.findById(subSectionId);
    if (!subSectionToUpdate) {
        throw new NotFoundError("SubSection not found");
    }

    const updatedData = {};
    if (title) updatedData.title = title;
    if (description) updatedData.description = description;
    if (timeDuration) updatedData.timeDuration = timeDuration;
    
    if (videoFile) {
        // upload new video to cloudinary
        const uploadDetails = await uploadImageToCloudinary(
            videoFile,
            process.env.COURSE_THUMBNAIL_FOLDER
        );
        updatedData.videoUrl = uploadDetails.secure_url;
    }

    // update subsection
    const updatedSubSection = await SubSection.findByIdAndUpdate(
        subSectionId,
        updatedData,
        { new: true }
    );

    return res.status(200).json({
        success: true,
        message: "SubSection updated successfully",
        data: updatedSubSection,
    });
});

// delete subsection controller
exports.deleteSubSection = catchAsync(async (req, res, next) => {
    // fetch subSectionId from request params
    const { subSectionId } = req.params;
    
    // validation
    if (!subSectionId) {
        throw new BadRequestError("SubSection ID is required");
    }

    const subSectionToDelete = await SubSection.findById(subSectionId);
    if (!subSectionToDelete) {
        throw new NotFoundError("SubSection not found");
    }

    // delete subsection
    await SubSection.findByIdAndDelete(subSectionId);
    
    return res.status(200).json({
        success: true,
        message: "SubSection deleted successfully",
    });
});
