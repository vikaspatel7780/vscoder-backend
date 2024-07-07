import { v2 as cloudinary } from 'cloudinary'; // Cloudinary v2 ka import statement
import fs from 'fs'; // File system module ka import

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Cloudinary cloud name environment variable se
    api_key: process.env.CLOUDINARY_API_KEY, // Cloudinary API key environment variable se
    api_secret: process.env.CLOUDINARY_API_SECRET  // Cloudinary API secret environment variable se
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            throw new Error('Local file path is missing.'); // Agar local file path missing hai, toh error throw karo
        }
        
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto' // Auto resource type se file upload karo
        });
        
        console.log('File uploaded successfully on Cloudinary:', response.secure_url); // File successfully upload hone ki confirmation
        
        // Successful upload ke baad local file ko delete karo
        fs.unlinkSync(localFilePath);
        
        return response;
    } catch (error) {
        console.error('Error uploading file to Cloudinary:', error); // Cloudinary mein file upload karne mein error
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath); // Agar error aata hai toh local file ko delete karo
            console.log('Local file deleted.');
        }
        throw error;
    }
};

export  { uploadOnCloudinary }; // uploadOnCloudinary function ko export karo
