import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Placing user order for frontend
const placeOrder = async (req,res) => {

    const frontend_url = process.env.FRONTEND_URL || "http://localhost:5173"

    try {
        const newOrder = new orderModel({
            userId: req.body.userId,
            items: req.body.items,
            amount: req.body.amount,
            address: req.body.address
        })
        newOrder.save()
        await userModel.findByIdAndUpdate(req.body.userId, {cartData:{}});


        // Line Items for Payment using Stripe
        const line_items = req.body.items.map((item)=>({
            price_data: {
                currency: "inr",
                product_data: {
                    name: item.name
                },
                unit_amount: item.price*100*80
            },
            quantity: item.quantity
        }))

        line_items.push({
            price_data: {
                currency: "inr",
                product_data: {
                    name: "Delivery Charges"
                },
                unit_amount: 5*100*80
            },
            quantity: 1
        })

        const session = await stripe.checkout.sessions.create({
            line_items: line_items,
            mode: 'payment',
            success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`
        })

        res.json({success: true, session_url: session.url})
        
    } catch (error) {
        console.log(error);
        res.json({success: false, message: "Payment Failed"})
    }
}

const verifyOrder = async (req, res) => {
    const {orderId, success} = req.body;
    try {
        if(success=="true"){
            await orderModel.findByIdAndUpdate(orderId, {payment: true})
            res.json({success: true, message: "Payment successful"})
        }
        else{
            await orderModel.findByIdAndDelete(orderId)
            res.json({success: false, message: "Payment failed"})
        }
    } catch (error) {
        console.log(error);
        res.json({success: false, message: "Payment failed"})
    }
}

const userOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({userId: req.body.userId })
        res.json({success: true, data: orders})
    } catch (error) {
        res.json({success: false, message: "Something went wrong"})
    }
}

// All orders list for admin
const listOrders = async (req, res) => {
    try {
        const user = await userModel.findOne({_id: req.body.userId, admin: true})
        if(user){
            const orders = await orderModel.find({});
            res.json({success:true, data:orders})
        }
        else{
            res.json({success:false, message: "Authorization Failed"})
        }
    } catch (error) {
        console.log(error);
        res.json({success:false, message: "Something went wrong"});
    }
}

// Order status update
const updateStatus = async (req, res) => {
    try {
        const user = await userModel.findOne({_id: req.body.userId, admin: true})
        if(user){
            await orderModel.findByIdAndUpdate(req.body.orderId, {status: req.body.status})
            res.json({success: true, message: "Status Updated"})
        }
        else{
            res.json({success:false, message: "Authorization Failed"})
        }
    } catch (error) {
        console.log(error);
        res.json({success: false, message: "Something went wrong"})
    }
}

export {placeOrder, verifyOrder, userOrders, listOrders, updateStatus}