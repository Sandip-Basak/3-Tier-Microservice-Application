import authMiddleware from '../middleware/auth.js';
import express from 'express'
import { validateToken } from '../controllers/validateToken.js';


const validateTokenRouter = express.Router();

validateTokenRouter.post("/validate", authMiddleware, validateToken);

export default validateTokenRouter;