import jwt from 'jsonwebtoken'

const authMiddleware = async (req,res,next) => {
    // Getting the token saved at the local storage
    const {token} = req.headers;
    if(!token){
        return res.json({
            success: false,
            message: "Authorization failed login again"
        })
    }
    
    // Verifying the token
    try {
        // Getting back the decoded USER ID from the token
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);

        // Adding userId to the request body
        req.body.userId = token_decode.id;
        
        // Sending it to the next function
        next();
    } catch (error) {
        console.log(error);
        return res.json({
            success: false,
            message: "Something went wrong"
        })
    }
}

export default authMiddleware;