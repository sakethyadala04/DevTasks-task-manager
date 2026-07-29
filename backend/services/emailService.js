import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendVerificationEmail = async ({ email, name, token }) => {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    const mailOptions = {
        from: `"DevTasks" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Verify Your DevTasks Account",
        html: `
            <h2>Welcome to DevTasks, ${name}!</h2>

            <p>Thank you for creating an account.</p>

            <p>Please click the button below to verify your email address:</p>

            <a href="${verificationUrl}"
               style="
                    display:inline-block;
                    padding:12px 24px;
                    background:#2563eb;
                    color:white;
                    text-decoration:none;
                    border-radius:6px;
               ">
                Verify Email
            </a>

            <p style="margin-top:20px;">
                If you did not create this account, you can safely ignore this email.
            </p>
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully:", info.response);
    } catch (error) {
        console.error("Email send failed:");
        console.error(error);
        throw error;
    }
};

export const sendPasswordResetEmail = async (email, token) => {
    try {
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

        await transporter.sendMail({
            from: `"DevTasks" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Reset Your DevTasks Password",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
                    <h2 style="color:#2563eb;">
                     🔐 Reset Your DevTasks Password
                    </h2>

                    <p>
                       Hello,
                    </p>

                    <p>
                       We received a request to reset the password for your DevTasks account.
                    </p>

                    <p>Click the button below to create a new password:</p>

                    <a
                        href="${resetUrl}"
                        style="
                            font-size:16px;
                            display:inline-block;
                            padding:14px 28px;
                            background:#2563eb;
                            color:#fff;
                            text-decoration:none;
                            border-radius:8px;
                            font-weight:bold;
                            box-shadow:0 4px 10px rgba(37,99,235,.25);
                        "
                    >
                        Reset Password
                    </a>

                    <p
                     style="
                         margin-top:20px;
                         color:#d97706;
                         font-weight:bold;
                        "
                    >
                         ⚠ This link expires in 24 hours.
                    </p>

                    <p>
                        If you didn't request a password reset, you can safely ignore this email.
                    </p>
                </div>
            `,
        });

        console.log("Password reset email sent.");
    } catch (error) {
        console.error("Password reset email failed:", error);
        throw error;
    }
};