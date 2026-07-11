import { useState } from "react";
import toast from "react-hot-toast";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import Card from "../../ui/Card";
import AdminService from "../../../services/AdminService";

export default function ChangePasswordCard({ email }) {

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [sendingOtp, setSendingOtp] = useState(false);

const [changingPassword, setChangingPassword] = useState(false);

async function handleSendOtp() {

    try {

        setSendingOtp(true);

        await AdminService.sendPasswordOtp(email);

        toast.success("OTP sent successfully.");

    }

    catch (error) {

        toast.error(

            error.response?.data?.message ||

            "Unable to send OTP."

        );

    }

    finally {

        setSendingOtp(false);

    }

}

async function handleChangePassword() {

    if (!newPassword.trim()) {

        toast.error("Please enter a new password.");

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

    if (!otp.trim()) {

        toast.error("Please enter OTP.");

        return;

    }

    try {

        setChangingPassword(true);

        await AdminService.changePassword({

            email,

            otp,

            newPassword

        });

        toast.success("Password updated successfully.");

        setNewPassword("");

        setConfirmPassword("");

        setOtp("");

    }

    catch (error) {

        toast.error(

            error.response?.data?.message ||

            "Unable to update password."

        );

    }

    finally {

        setChangingPassword(false);

    }

}

    return (

        <Card className="p-6">

            <h2 className="text-xl font-semibold">
                Change Password
            </h2>

            <p className="text-sm text-[var(--text-secondary)] mt-2">
                Secure your administrator account by changing your password.
            </p>

            <div className="mt-6 space-y-4">

                <Input
                    label="Admin Email"
                    value={email}
                    disabled
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

                <div className="flex gap-3">

                    <Input
                        className="flex-1"
                        label="OTP"
                        value={otp}
                        onChange={(e)=>setOtp(e.target.value)}
                    />

                    <div className="flex items-end">

                        <Button
    onClick={handleSendOtp}
    disabled={sendingOtp}
>

    {sendingOtp
        ? "Sending..."
        : "Send OTP"}

</Button>

                    </div>

                </div>

                <Button
    className="w-full"
    onClick={handleChangePassword}
    disabled={changingPassword}
>

    {

        changingPassword

        ?

        "Updating..."

        :

        "Update Password"

    }

</Button>

            </div>

        </Card>

    );

}