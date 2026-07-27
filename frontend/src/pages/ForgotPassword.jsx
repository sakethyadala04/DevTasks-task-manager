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

        setLoading(true);

        try {
            const { data } = await axios.post(
                `${API_URL}/api/user/forgot-password`,
                { email }
            );

            toast.success(data.message);

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
        <div className="max-w-md w-full bg-white shadow-lg rounded-xl p-8 border border-purple-100">

            <h2 className="text-2xl font-bold text-center mb-2">
                Forgot Password
            </h2>

            <p className="text-center text-gray-500 mb-6">
                Enter your email and we'll send you a password reset link.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">

                <div className={INPUTWRAPPER}>
                    <Mail className="w-5 h-5 text-purple-500 mr-2" />

                    <input
                        type="email"
                        placeholder="Enter your email"
                        className="w-full focus:outline-none"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <button
                    type="submit"
                    className={BUTTON_CLASSES}
                    disabled={loading}
                >
                    {loading ? "Sending..." : "Send Reset Link"}
                </button>

            </form>

            <Link
                to="/login"
                className="flex items-center justify-center gap-2 mt-6 text-purple-600 hover:underline"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
            </Link>

        </div>
    );
};

export default ForgotPassword;