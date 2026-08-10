import mongoose from "mongoose";

export const connectDB = async () => {
    const mongoURI = process.env.MONGO_URI || 'mongodb://mongodb-service:27017/food-del';
    await mongoose.connect(mongoURI)
    .then(()=>{
        console.log("Database Connected");
    })
    .catch((err) => {
        console.error("Database Connection Error:", err);
    });
}