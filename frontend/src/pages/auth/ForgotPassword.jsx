import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

import AuthService from "../../services/AuthService";

import toast from "react-hot-toast";

export default function ForgotPassword() {
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(0);

    useEffect(() => {
        if (timer <= 0) return;

        const interval = setInterval(() => {
            setTimer((value) => {
                if (value <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return value - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [timer]);

    async function handleSendOtp() {
        if (!email.trim()) {
            toast.error("Please enter your email.");
            return;
        }

        setLoading(true);

        try {
            const response = await AuthService.forgotPassword({ email: email.trim() });

            toast.success(response.data.message);
            setStep(2);
            setTimer(60);

            // STEP 6: Auto focus the OTP input box once step 2 renders
            setTimeout(() => {
                document.getElementById("otp-input")?.focus();
            }, 100);
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to send OTP.");
        } finally {
            setLoading(false);
        }
    }

    async function handleResetPassword() {
        if (!otp.trim()) {
            toast.error("Please enter OTP.");
            return;
        }

        if (otp.length !== 6) {
            toast.error("OTP must be 6 digits.");
            return;
        }

        if (!newPassword) {
            toast.error("Please enter password.");
            return;
        }

        if (newPassword.length < 8) {
            toast.error("Password must be at least 8 characters.");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const response = await AuthService.resetPassword({
    email: email.trim(),
    otp,
    newPassword
});

            toast.success(response.data.message);
            setOtp("");
            setNewPassword("");
            setConfirmPassword("");
            setEmail("");
            setStep(1);
            setTimer(0);

            setTimeout(() => {
                navigate("/login");
            }, 1500);
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to reset password.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="login-page">
            <Card className="login-card p-8">
                <h1 className="login-title">Forgot Password</h1>
                <p className="login-subtitle">Recover your PingMe account</p>

                {step === 1 && (
                    <div className="space-y-5 mt-6">
                        <Input
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <Button
                            className="w-full"
                            onClick={handleSendOtp}
                            disabled={loading || timer > 0}
                        >
                            {loading
                                ? "Sending OTP..."
                                : timer > 0
                                ? `Resend in ${timer}s`
                                : "Send OTP"}
                        </Button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-5 mt-6">
                        {/* STEP 6: Appended the correct id attribute here */}
                        <Input
                            id="otp-input"
                            label="OTP"
                            value={otp}
                            maxLength={6}
                            inputMode="numeric"
                            onChange={(e) =>
                                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                            }
                        />
                        <div className="flex justify-end">
                            {timer > 0 ? (
                                <p className="text-sm text-gray-500">
                                    Resend OTP in {timer}s
                                </p>
                            ) : (
                                <button
    type="button"
    onClick={handleSendOtp}
    disabled={loading}
    className="text-sm text-indigo-600 hover:underline disabled:opacity-50"
>
    {loading ? "Sending..." : "Resend OTP"}
</button>
                            )}
                        </div>

                        <Input
                            label="New Password"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />

                        <Input
                            label="Confirm Password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />

                        {/* STEP 7: Updated the validation conditions for the disabled flag */}
                        <Button
                            className="w-full"
                            onClick={handleResetPassword}
                            disabled={
                                loading ||
                                otp.length !== 6 ||
                                newPassword.length < 8 ||
                                confirmPassword !== newPassword
                            }
                        >
                            {loading ? "Updating..." : "Reset Password"}
                        </Button>
                    </div>
                )}

                <div className="mt-6 text-center">
                    <button
                        type="button"
                        onClick={() => navigate("/login")}
                        className="text-sm font-medium text-indigo-600 hover:underline"
                    >
                        ← Back to Login
                    </button>
                </div>
            </Card>
        </div>
    );
}