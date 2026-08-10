import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import foodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/userRoute.js";
import 'dotenv/config'
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import validateTokenRouter from "./routes/validateTokenRoute.js";


// app config
const app = express()
const port = process.env.PORT || 4000

// middleware
app.use(express.json())
app.use(cors())

// Database Connect
connectDB();

// API Endpoints
app.use("/api/food",foodRouter)
app.use("/images", (req, res, next) => {
    if (process.env.AWS_S3_BUCKET_NAME) {
        const region = process.env.AWS_REGION || "us-east-1";
        const s3Url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${region}.amazonaws.com${req.path}`;
        return res.redirect(s3Url);
    }
    next();
}, express.static('uploads')) // For showing the images
app.use("/api/user",userRouter)
app.use("/api/cart/",cartRouter)
app.use("/api/order",orderRouter)
app.use("/api", validateTokenRouter)

app.get("/",(req, res)=>{
    res.send("API Working")
})

app.listen(port,()=>{
    console.log(`Server started on http://localhost:${port}`);
    
})

