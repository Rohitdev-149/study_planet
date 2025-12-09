const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

// create subsection controller
exports.createSubSection = async (req, res) => {
    try {
        // fetch data from request body
        const { sectionId, title,description,timeDuration,video } = req.body;
        // validation
        if (!title || !sectionId || !description || !timeDuration || !video) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }
        //upload video to cloudinary
        const uploadDetails = await uploadImageToCloudinary(
            video,
            process.env.COURSE_THUMBNAIL_FOLDER
        );
        // create subsection
        const SubSectionDetail = await SubSection.create({
            title,
            description, 
            timeDuration,
            video: uploadDetails.secure_url,
        });
        // update section with this subsection object id
        const UpdatedSection = await Section.findByIdAndUpdate(
          sectionId,
          { $push: { SubSection: SubSectionDetail._id } },
          { new: true }
        ).populate("SubSection");
        return res.status(200).json({
          success: true,
          message: "SubSection created successfully",
          data: UpdatedSection,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in creating subsection",
            error: error.message,
        });
    }
}
// update subsection controller
exports.updateSubSection = async (req, res) => {
    try {
        // fetch data from request body
        const { subSectionId, title, description, timeDuration, video } = req.body;
        // validation
        if (!subSectionId) {
            return res.status(400).json({
                success: false,
                message: "SubSection ID is required",
            });
        }
        const updatedData = {};
        if (title) updatedData.title = title;
        if (description) updatedData.description = description;
        if (timeDuration) updatedData.timeDuration = timeDuration;
        if (video) {
            // upload new video to cloudinary
            const uploadDetails = await uploadImageToCloudinary(
                video,
                process.env.COURSE_THUMBNAIL_FOLDER
            );
            updatedData.video = uploadDetails.secure_url;
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
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in updating subsection",
            error: error.message,
        });
    }
}
// delete subsection controller
exports.deleteSubSection = async (req, res) => {
    try {
        // fetch subSectionId from request params
        const { subSectionId } = req.params;
        // validation
        if (!subSectionId) {
            return res.status(400).json({
                success: false,
                message: "SubSection ID is required",
            });
        }
        // delete subsection
        await SubSection.findByIdAndDelete(subSectionId);
        return res.status(200).json({
            success: true,
            message: "SubSection deleted successfully",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
        success: false,
        message: "Error in deleting subsection",
        error: error.message,
    });
  }
}
