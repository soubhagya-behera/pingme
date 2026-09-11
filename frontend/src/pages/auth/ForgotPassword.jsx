import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

import AuthService from "../../services/AuthService";

import toast from "react-hot-toast";
import { ShieldCheck } from "lucide-react";
import "../../styles/auth/forgot-otp.css";

function maskEmail(email) {
    if (!email || !email.includes("@")) return "";
    const [local, domain] = email.split("@");
    if (local.length <= 2) return `${local[0]}••••@${domain}`;
    return `${local[0]}••••••@${domain}`;
}

export default function ForgotPassword() {
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(0);

    const otpRefs = useRef([]);

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

    useEffect(() => {
        if (step === 2) {
            setTimeout(() => {
                otpRefs.current[0]?.focus();
            }, 80);
        }
    }, [step]);

    function handleOtpChange(index, value) {
        const digit = value.replace(/\D/g, "").slice(-1);
        const next = otp.split("");
        while (next.length < 6) next.push("");
        if (digit) {
            next[index] = digit;
            const newOtp = next.join("").slice(0, 6);
            setOtp(newOtp);
            if (index < 5) otpRefs.current[index + 1]?.focus();
        } else {
            next[index] = "";
            setOtp(next.join("").slice(0, 6));
        }
    }

    function handleOtpKeyDown(index, e) {
        if (e.key === "Backspace") {
            if (!otp[index] && index > 0) {
                e.preventDefault();
                const next = otp.split("");
                while (next.length < 6) next.push("");
                next[index - 1] = "";
                setOtp(next.join("").trim());
                otpRefs.current[index - 1]?.focus();
            } else if (otp[index]) {
                const next = otp.split("");
                while (next.length < 6) next.push("");
                next[index] = "";
                setOtp(next.join("").trim());
            }
        }
        if (e.key === "ArrowLeft" && index > 0) otpRefs.current[index - 1]?.focus();
        if (e.key === "ArrowRight" && index < 5) otpRefs.current[index + 1]?.focus();
    }

    function handleOtpPaste(e) {
        e.preventDefault();
        const pasted = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, 6);
        if (!pasted) return;
        setOtp(pasted);
        const nextIndex = Math.min(pasted.length, 5);
        setTimeout(() => otpRefs.current[nextIndex]?.focus(), 0);
    }

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

            setTimeout(() => {
                otpRefs.current[0]?.focus();
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

    if (step === 2) {
        return (
            <div className="forgot-otp-page">
                <div className="forgot-otp-card">
                    <div className="forgot-otp-icon" aria-hidden="true">
                        <ShieldCheck size={26} strokeWidth={2.2} />
                    </div>
                    <h1 className="forgot-otp-title">Verify your account</h1>
                    <p className="forgot-otp-subtitle">Enter the 6-digit code we sent to your email.</p>
                    {email.trim() && (
                        <p className="forgot-otp-masked">Code sent to {maskEmail(email.trim())}</p>
                    )}

                    <div className="forgot-otp-form">
                        <div className="otp-box-row" onPaste={handleOtpPaste}>
                            {Array.from({ length: 6 }).map((_, i) => (
                                <input
                                    key={i}
                                    ref={(el) => (otpRefs.current[i] = el)}
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    maxLength={1}
                                    value={otp[i] || ""}
                                    onChange={(e) => handleOtpChange(i, e.target.value)}
                                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                    className={`otp-box ${otp[i] ? "filled" : ""}`}
                                    aria-label={`OTP digit ${i + 1}`}
                                />
                            ))}
                        </div>

                        <div className="forgot-otp-fields">
                            <Input
                                label="New Password"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="At least 8 characters"
                            />

                            <Input
                                label="Confirm Password"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Re-enter password"
                            />
                        </div>

                        <Button
                            className="forgot-otp-verify-btn"
                            onClick={handleResetPassword}
                            disabled={
                                loading ||
                                otp.length !== 6 ||
                                newPassword.length < 8 ||
                                confirmPassword !== newPassword
                            }
                        >
                            {loading ? "Verifying..." : "Verify OTP"}
                        </Button>

                        <div className="forgot-otp-resend">
                            <span>Didn&apos;t receive the code?</span>
                            {timer > 0 ? (
                                <span>Resend OTP in {timer}s</span>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleSendOtp}
                                    disabled={loading}
                                >
                                    Resend OTP
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="forgot-otp-back">
                        <button type="button" onClick={() => navigate("/login")}>
                            ← Back to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="login-page">
            <Card className="login-card p-8">
                <h1 className="login-title">Forgot Password</h1>
                <p className="login-subtitle">Recover your PingMe account</p>

                <div className="space-y-5 mt-6">
                    <Input
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
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
