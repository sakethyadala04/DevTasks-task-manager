import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is missing");
}

export default async function authMiddleware(req, res, next) {
  // Grab the Bearer token from the Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ success: false, message: 'Not Authorization . Token Missing' });
  }

const token = authHeader.split(' ')[1];

// VERIFY & ATTACH USER OBJECT

try {
    const payload = jwt.verify(token, JWT_SECRET);


        // support multiple token shapes: { userId }, { id }, { _id }
    const userId = payload.userId || payload.id || payload._id;
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: 'Not Authorized . Token Invalid' });
    }

    const user = await User.findById(userId).select('-password');

    if(!user) {
        return res.status(401).json({success: false, message: "User not Found"});
    }

    // Attach both for convenience
    req.user = user;
    req.userId = user._id;

    next();
}

    catch (err) {
        console.error("JWT verification failed:", err);
             return res.status(401).json({ success: false, message: 'Not Authorized . Token is invalid or exprired'});            
}
}