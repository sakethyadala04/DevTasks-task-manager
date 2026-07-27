import crypto from "crypto";

// Generate a secure random token
export const generateVerificationToken = () => {
    return crypto.randomBytes(32).toString("hex");
};

// Hash a token before storing it in the database
export const hashToken = (token) => {
    return crypto.createHash("sha256").update(token).digest("hex");
};