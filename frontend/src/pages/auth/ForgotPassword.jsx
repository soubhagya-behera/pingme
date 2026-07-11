import { useState } from "react";
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

    async function handleSendOtp() {

    if (!email.trim()) {

        toast.error("Please enter your email.");

        return;

    }

    setLoading(true);

    try {

        const response =
            await AuthService.forgotPassword({

                email

            });

        toast.success(response.data.message);

        setStep(2);

    }

    catch (error) {

        toast.error(

            error.response?.data?.message ||

            "Unable to send OTP."

        );

    }

    finally {

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

        const response =
            await AuthService.resetPassword({

                email,

                otp,

                newPassword

            });

        toast.success(response.data.message);

        navigate("/login");

    }

    catch (error) {

        toast.error(

            error.response?.data?.message ||

            "Unable to reset password."

        );

    }

    finally {

        setLoading(false);

    }

}

    return (

        <div className="login-page">

            <Card className="login-card p-8">

                <h1 className="login-title">

                    Forgot Password

                </h1>

                <p className="login-subtitle">

                    Recover your PingMe account

                </p>

                {step === 1 && (

                    <div className="space-y-5 mt-6">

                        <Input

                            label="Email"

                            type="email"

                            value={email}

                            onChange={(e)=>setEmail(e.target.value)}

                        />

                        <Button
    className="w-full"
    onClick={handleSendOtp}
    disabled={loading}
>

    {loading ? "Sending..." : "Send OTP"}

</Button>

                    </div>

                )}

                {step === 2 && (

                    <div className="space-y-5 mt-6">

                        <Input

                            label="OTP"

                            value={otp}

                            onChange={(e)=>setOtp(e.target.value)}

                        />

                        <Input

                            label="New Password"

                            type="password"

                            value={newPassword}

                            onChange={(e)=>setNewPassword(e.target.value)}

                        />

                        <Input

                            label="Confirm Password"

                            type="password"

                            value={confirmPassword}

                            onChange={(e)=>setConfirmPassword(e.target.value)}

                        />

                        <Button
    className="w-full"
    onClick={handleResetPassword}
    disabled={loading}
>

    {loading ? "Updating..." : "Reset Password"}

</Button>

                    </div>

                )}

            </Card>

        </div>

    );

}