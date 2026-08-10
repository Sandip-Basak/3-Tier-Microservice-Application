import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";

// Initialize S3 client (Supports IRSA in EKS or explicit AWS credentials)
const getS3Client = () => {
    if (!process.env.AWS_S3_BUCKET_NAME) return null;

    const config = {
        region: process.env.AWS_REGION || "us-east-1"
    };

    // If static keys are specified in .env, use them; otherwise, AWS SDK automatically resolves IRSA / IAM credentials
    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
        config.credentials = {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        };
    }

    return new S3Client(config);
};

export const uploadToS3 = async (file) => {
    const s3Client = getS3Client();
    if (!s3Client || !process.env.AWS_S3_BUCKET_NAME) return null;

    try {
        const fileStream = fs.createReadStream(file.path);
        const fileName = `${Date.now()}_${file.originalname}`;

        const uploadParams = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: fileName,
            Body: fileStream,
            ContentType: file.mimetype
        };

        await s3Client.send(new PutObjectCommand(uploadParams));

        // Cleanup local file after successful S3 upload
        try {
            fs.unlinkSync(file.path);
        } catch (err) {
            console.error("Local file cleanup error:", err);
        }

        return fileName;
    } catch (error) {
        console.error("Error uploading to S3:", error);
        return null;
    }
};

export const deleteFromS3 = async (fileName) => {
    const s3Client = getS3Client();
    if (!s3Client || !process.env.AWS_S3_BUCKET_NAME) return false;

    try {
        const deleteParams = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: fileName
        };

        await s3Client.send(new DeleteObjectCommand(deleteParams));
        return true;
    } catch (error) {
        console.error("Error deleting from S3:", error);
        return false;
    }
};
