import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const uploadFileOnCloudinary = async (path) => {
  try {
    if (!path) return null;
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const uploadResult = await cloudinary.uploader.upload(path, {
      resource_type: "auto",
    });

    console.log("File is uploaded on cloudinary ", uploadResult.url);
    fs.unlinkSync(path);
    return uploadResult;
  } catch (e) {
    console.log("Cloudinary error ", e);
    fs.unlinkSync(path); //remove the locally saved temporary file as the file upload failed
    return null;
  }
};

export { uploadFileOnCloudinary };
