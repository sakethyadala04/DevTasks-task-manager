import express from 'express';
import authMiddleware from '../middleware/auth.js';

import {
    registerUser,
    loginUser,
    googleLogin,
    getCurrentUser,
    updateProfile,
    changePassword,
} from "../controllers/userController.js";

const userRouter = express.Router();

// PUBLIC LINKS

userRouter.post('/register' , registerUser);
userRouter.post('/login' , loginUser);
userRouter.post("/google", googleLogin);

// PRIVATE LINKS protected also

userRouter.get('/me' , authMiddleware , getCurrentUser);
userRouter.put('/profile' , authMiddleware , updateProfile);
userRouter.put('/password' , authMiddleware , changePassword);

export default userRouter;