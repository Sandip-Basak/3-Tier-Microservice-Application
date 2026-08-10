import userModel from "../models/userModel.js";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import validator from 'validator'

// Creating a token using the USER ID (_id)
const createToken = (id) => {
    return jwt.sign({id},process.env.JWT_SECRET);
}

// Login User
const loginUser = async (req, res) => {
    const {email,password} = req.body;
    try {
        const user = await userModel.findOne({email});

        if(!user){
            return res.json({success: false, message: "Invalid Credentials"})
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        
        if(!isMatch){
            return res.json({success: false, message: "Invalid Credentials"})
        }

        const token = createToken(user._id);
        
        res.json({success: true, token})

    } catch (error) {
        console.log(error);
        res.json({success:false, message: "Error"})
    }
}

// Admin Login
const loginAdmin = async (req, res) => {
    const {email,password} = req.body;
    try {
        const user = await userModel.findOne({email:email, admin:true});

        if(!user){
            return res.json({success: false, message: "Invalid Credentials"})
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        
        if(!isMatch){
            return res.json({success: false, message: "Invalid Credentials"})
        }

        const token = createToken(user._id);
        
        res.json({success: true, token})

    } catch (error) {
        console.log(error);
        res.json({success:false, message: "Error"})
    }
}

// Register User
const registerUser = async (req, res) => {
    const {name, password, email} = req.body;
    try {
        // Checking if the user already exists
        const exists = await userModel.findOne({email});
        if(exists){
            return res.json({success: false, message: "User already exists"})
        }
        
        // Checking if the email is valid
        if(!validator.isEmail(email)){
            return res.json({success: false, message: "Please enter a valid email"})
        }
        
        // Checking is the password is strong
        if(!validator.isStrongPassword(password)){
            return res.json({success: false, message: "Please enter a strong password"})
        }

        // Hashing user password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Creating new user
        const newUser = new userModel({
            name: name,
            email: email,
            password: hashedPassword
        })

        const user = await newUser.save()

        const token = createToken(user._id)

        res.json({success: true, token})
        
    } catch (error) {
        console.log(error);
        res.json({success: false, message: "Error"})
    }
}

export {loginUser, registerUser, loginAdmin}