import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Mail } from "lucide-react";
import { INPUTWRAPPER, BUTTON_CLASSES } from "../assets/dummy";

import { useNavigate } from "react-router-dom";


const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:5000").replace(/\/+$/, "");

const ResendVerification = () => {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);

        try {

            const { data } = await axios.post(
                `${API_URL}/api/user/resend-verification`,
                { email }
            );

            toast.success(data.message);

            setTimeout(() => {
                navigate("/login");
            }, 2000);

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
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white shadow-lg border border-purple-100 rounded-xl p-8">

                <h2 className="text-2xl font-bold text-center mb-2">
                    Resend Verification Email
                </h2>

                <p className="text-center text-gray-500 mb-6">
                    Enter your email to receive a new verification link.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">

                    <div className={INPUTWRAPPER}>
                        <Mail className="w-5 h-5 text-purple-500 mr-2" />

                        <input
                            type="email"
                            placeholder="Email"
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
                        {loading ? "Sending..." : "Send Verification Email"}
                    </button>

                </form>

            </div>
        </div>

    );
};

export default ResendVerification;