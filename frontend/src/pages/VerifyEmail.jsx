import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setLoading(false);
        setSuccess(false);
        setMessage("Verification token is missing.");
        return;
      }

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/user/verify-email`,
          {
            params: { token },
          }
        );

        setSuccess(true);
        setMessage(response.data.message);
      } catch (error) {
        setSuccess(false);

        setMessage(
          error.response?.data?.message ||
            "Something went wrong while verifying your email."
        );
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Verifying your email...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-xl p-8 text-center">

        <h1 className="text-3xl font-bold mb-4">
          {success ? "✅ Email Verified" : "❌ Verification Failed"}
        </h1>

        <p className="text-gray-600 mb-6">
          {message}
        </p>

        <Link
          to="/login"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Go to Sign In
        </Link>

      </div>
    </div>
  );
};

export default VerifyEmail;