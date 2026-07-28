import express from 'express';
import authMiddleware from '../middleware/auth.js';

import {
    registerUser,
    loginUser,
    googleLogin,
    verifyEmail,
    forgotPassword,
    resetPassword,
    getCurrentUser,
    updateProfile,
    changePassword,
    resendVerificationEmail,
    deleteAccount,
} from "../controllers/userController.js";

const userRouter = express.Router();

// PUBLIC LINKS

userRouter.post('/register' , registerUser);
userRouter.post('/login' , loginUser);
userRouter.post("/google", googleLogin);
userRouter.get("/verify-email", verifyEmail);

userRouter.post('/forgot-password', forgotPassword);
userRouter.post('/reset-password', resetPassword);
userRouter.post("/resend-verification", resendVerificationEmail);
userRouter.delete("/delete", authMiddleware, deleteAccount);

// PRIVATE LINKS protected also

userRouter.get('/me' , authMiddleware , getCurrentUser);
userRouter.put('/profile' , authMiddleware , updateProfile);
userRouter.put('/password' , authMiddleware , changePassword);

export default userRouter;