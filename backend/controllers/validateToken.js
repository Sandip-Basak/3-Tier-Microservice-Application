import userModel from "../models/userModel.js";
import jwt from 'jsonwebtoken'

const validateToken = async (req,res) => {
    try {
        const user = await userModel.findOne({_id: req.body.userId, admin: true})
        if(user){
            res.json({success:true, message:"Authentication successful"})
        }
        else{
            res.json({success:false, message:"Authentication Failed ! Login again"})
        }
    } catch (error) {
        console.log(error);
        res.json({success:false, message:"Authentication Failed ! Login again"})
    }
}

export {validateToken} 