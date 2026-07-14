import { useState } from "react";
import toast from "react-hot-toast";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import PasswordStrength from "./PasswordStrength";
import UserService from "../../../services/UserService";

export default function PasswordCard() {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    // Handle field updates dynamically
    function handleChange(e) {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    }

    // Submit request to the backend UserService
    async function submit(e) {
        e.preventDefault();
        try {
            setLoading(true);
            await UserService.changePassword(form);
            
            toast.success("Password updated successfully");
            
            // Clear the form fields upon success
            setForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });
        } catch (error) {
            toast.error(
                error.response?.data?.message || 
                "Unable to change password"
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={submit} className="space-y-6">
            <Input
                label="Current Password"
                name="currentPassword"
                type="password"
                value={form.currentPassword}
                onChange={handleChange}
            />

            <Input
                label="New Password"
                name="newPassword"
                type="password"
                value={form.newPassword}
                onChange={handleChange}
            />

            <PasswordStrength password={form.newPassword} />

            <Input
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
            />

            <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Password"}
            </Button>
        </form>
    );
}