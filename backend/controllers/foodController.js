import foodModel from "../models/foodModel.js";
import fs from 'fs';
import userModel from "../models/userModel.js";
import jwt from 'jsonwebtoken';
import { uploadToS3, deleteFromS3 } from "../config/s3.js";


// Add Food Item
const addFood = async (req, res) => {
    try {
        const { token } = req.headers;
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findOne({_id: token_decode.id, admin: true})

        if(user){
            let image_filename = `${req.file.filename}`;

            // Upload to S3 if configured
            if (process.env.AWS_S3_BUCKET_NAME) {
                const s3Key = await uploadToS3(req.file);
                if (s3Key) {
                    image_filename = s3Key;
                }
            }
    
            const food = new foodModel({
                name: req.body.name,
                description: req.body.description,
                price: req.body.price,
                category: req.body.category,
                image: image_filename
            })
    
            await food.save()
            res.json({
                success: true,
                message: "Food Added"
            })
        }
        else{
            res.json({ success: false, message: "Authorization Failed" })
        }

    } catch (error) {
        console.log(error)
        res.json({
            success: false,
            message: "Error"
        })
    }
}

// All Food List
const listFood = async (req, res) => {
    try {
        const foods = await foodModel.find({});
        res.json({
            success: true,
            data: foods
        })
    } catch (error) {
        res.json({
            success: false,
            message: "Error"
        })
    }
}

const removeFood = async (req, res) => {

    try {
        const user = await userModel.findOne({ _id: req.body.userId, admin: true })
        if (user) {
            const food = await foodModel.findById(req.body.id);
            
            // Delete from S3 if bucket configured, else local file system
            if (process.env.AWS_S3_BUCKET_NAME) {
                await deleteFromS3(food.image);
            } else {
                fs.unlink(`uploads/${food.image}`, () => { });
            }

            await foodModel.findByIdAndDelete(req.body.id);
            res.json({
                success: true,
                message: "Food Deleted"
            })
        }
        else {
            res.json({ success: false, message: "Authorization Failed" })
        }
    } catch (error) {
        console.log(error)
        res.json({
            success: false,
            message: "Error"
        })
    }

}

export { addFood, listFood, removeFood }