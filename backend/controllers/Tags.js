const Tag=require('../models/Tag');

// create tag handler
exports.createTag=async(req,res)=>{
    try {
        // fetch data from request body
        const {name,description}=req.body;
        // validate data
        if(!name || !description){
            return res.status(400).json({
                success:false,
                message:"Name and Description are required"
            });
        }
        // create entry in database
        const tagDetails={
            name,
            description
        };
        //return response
        const tag=await Tag.create(tagDetails);
        return res.status(201).json({
            success:true,
            message:"Tag created successfully",
            tag
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({   
            success:false,
            message:"Error in creating tag",
            error:error.message
        });
    }
}// get all tags handler
exports.getAllTags=async(req,res)=>{
    try {
        // fetch all tags from database
        const allTags=await Tag.find({},{name:true,description:true});
        // return response
        return res.status(200).json({
            success:true,
            message:" All Tags fetched successfully",
            allTags
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Error in fetching tags",
            error:error.message
        });
    }
};