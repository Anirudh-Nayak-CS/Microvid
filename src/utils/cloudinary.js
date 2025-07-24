import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadFileOnCloudinary = async (path) => {
  try {
    if (!path) return null;
    const uploadResult = await cloudinary.uploader.upload(path, {
      public_id: "shoes",
      resource_type: "auto",
    });

    console.log("File is uploaded on cloudinary ", uploadResult.url);
    return uploadResult;
  } catch (e) {
    fs.unlinkSync(path); //remove the locally saved temporary file as the file upload failed
    return null;
  }
};

export { uploadFileOnCloudinary };
