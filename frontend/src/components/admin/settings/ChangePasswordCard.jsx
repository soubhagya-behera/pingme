import { useState } from "react";
import Card from "../../ui/Card";
import Button from "../../ui/Button";
import Input from "../../ui/Input";

export default function ChangePasswordCard({ email }) {

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [otp, setOtp] = useState("");

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

                        <Button>

                            Send OTP

                        </Button>

                    </div>

                </div>

                <Button className="w-full">

                    Update Password

                </Button>

            </div>

        </Card>

    );

}