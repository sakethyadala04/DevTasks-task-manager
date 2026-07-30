import { BrevoClient } from "@getbrevo/brevo";

const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY,
});

const sender = {
  name: "DevTasks",
  email: process.env.BREVO_SENDER_EMAIL,
};

export const sendVerificationEmail = async ({ email, name, token }) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  await brevo.transactionalEmails.sendTransacEmail({
    sender,
    to: [
      {
        email,
        name,
      },
    ],
    subject: "Verify Your DevTasks Account",
    htmlContent: `
      <h2>Welcome to DevTasks, ${name}!</h2>

      <p>Thank you for creating an account.</p>

      <p>Please click the button below to verify your email address:</p>

      <a
        href="${verificationUrl}"
        style="
          display:inline-block;
          padding:12px 24px;
          background:#2563eb;
          color:white;
          text-decoration:none;
          border-radius:6px;
        "
      >
        Verify Email
      </a>

      <p style="margin-top:20px;">
        If you did not create this account, you can safely ignore this email.
      </p>
    `,
  });
};

export const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  await brevo.transactionalEmails.sendTransacEmail({
    sender,
    to: [
      {
        email,
      },
    ],
    subject: "Reset Your DevTasks Password",
    htmlContent: `
      <h2>Reset Your Password</h2>

      <p>Click the button below to reset your password:</p>

      <a
        href="${resetUrl}"
        style="
          display:inline-block;
          padding:12px 24px;
          background:#2563eb;
          color:white;
          text-decoration:none;
          border-radius:6px;
        "
      >
        Reset Password
      </a>

      <p>This link expires in 24 hours.</p>

      <p>If you didn't request a password reset, you can safely ignore this email.</p>
    `,
  });
};