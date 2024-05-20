import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Log environment variables for debugging
console.log(process.env.CLOUDINARY_CLOUD_NAME);
console.log(process.env.CLOUDINARY_API_KEY);
console.log(process.env.CLOUDINARY_API_SECRETE);

// Configure Cloudinary using environment variables
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRETE
});

const uploadFileOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            console.log("Local file path is missing or invalid.");
            return null;
        }

        // Upload the file to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });

        // File has been successfully uploaded
        console.log("File uploaded to Cloudinary:", response.url);

        fs.unlinkSync(localFilePath);  // file remove karnyasathi ekda upload zali ki



        return response;
    } catch (error) {
        console.error("Error uploading file to Cloudinary:", error);

        if (localFilePath) {
            // Attempt to delete the local file
            try {
                await fs.promises.unlink(localFilePath);
                console.log("Local file deleted:", localFilePath);
            } catch (unlinkError) {
                console.error("Error deleting local file:", unlinkError);
            }
        }

        return null;
    }
};

export { uploadFileOnCloudinary };
