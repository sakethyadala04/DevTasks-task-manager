import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import { INPUTWRAPPER, BUTTON_CLASSES } from "../assets/dummy";

const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:5000").replace(/\/+$/, "");

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email.trim()) {
            toast.error("Email is required.");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            toast.error("Please enter a valid email address.");
            return;
        }

        setLoading(true);

        try {
            const { data } = await axios.post(
                `${API_URL}/api/user/forgot-password`,
                { email }
            );

            toast.success(
                "Password reset link sent! Please check your email inbox."
            );

            setEmail("");

        } catch (err) {
            toast.error(
                err.response?.data?.message ||
                "Something went wrong."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-10">

            {/* Header */}
            <div className="flex items-center gap-5 pb-1 ">

                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                    <Mail className="h-8 w-8 text-white" />
                </div>

                <div>
                    <h2 className="text-3xl font-bold text-gray-900">
                        Forgot Password
                    </h2>

                    <p className="mt-1 text-gray-500">
                        Enter your email and we'll send you a reset link.
                    </p>
                </div>

            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-8 space-y-7">

                <div className={INPUTWRAPPER}>
                    <Mail className="w-5 h-5 text-purple-500 mr-4" />

                    <input
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-transparent text-gray-700 focus:outline-none"
                        required
                    />
                </div>

                <button
                    type="submit"
                    className={BUTTON_CLASSES}
                    disabled={loading}
                >
                    {loading ? (
                        "Sending..."
                    ) : (
                        <div className="flex items-center justify-center gap-2">
                            <Mail className="w-4 h-4" />
                            Send Reset Link
                        </div>
                    )}
                </button>

            </form>

            {/* Footer */}
            <div className="mt-6 pt-1 flex justify-center">

                <Link
                    to="/login"
                    className="flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700 transition"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Login
                </Link>

            </div>

        </div>
    );
};

export default ForgotPassword;