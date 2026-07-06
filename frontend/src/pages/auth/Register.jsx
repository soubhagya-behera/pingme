import "./Register.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import AuthService from "../../services/AuthService";

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch("password");

  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      await AuthService.register({
        fullName: data.fullName,
        email: data.email,
        profession: data.profession,
        phone: data.phone,
        bio: data.bio,
        password: data.password,
      });
      toast.success("Registration Successful");
      navigate("/register-success");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-left">
        <h1 className="brand">PingMe</h1>
        <h2 className="brand-text">Connect. Collaborate. Communicate.</h2>
        <p className="brand-subtitle">
          A modern communication platform designed for teams, friends and
          communities. Fast, secure and beautifully simple.
        </p>
        <div className="feature-list">
          <div className="feature">
            <div className="feature-icon">💬</div>
            <div>
              <div className="feature-title">Real-time Messaging</div>
              <div className="feature-text">Instant conversations powered by WebSocket.</div>
            </div>
          </div>
          <div className="feature">
            <div className="feature-icon">🔒</div>
            <div>
              <div className="feature-title">Enterprise Security</div>
              <div className="feature-text">JWT authentication with encrypted passwords.</div>
            </div>
          </div>
          <div className="feature">
            <div className="feature-icon">⚡</div>
            <div>
              <div className="feature-title">Lightning Fast</div>
              <div className="feature-text">Optimized for speed across all devices.</div>
            </div>
          </div>
        </div>
      </div>

      <div className="register-right">
        <Card className="register-card">
          <h2 className="register-title">Create Account 🚀</h2>
          <p className="register-subtitle">Create your PingMe account to get started.</p>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <Input
                placeholder="Full Name"
                {...register("fullName", { required: "Full Name is required" })}
                error={errors.fullName?.message}
              />
            </div>
            <div className="form-group">
              <Input
                placeholder="Email"
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: { value: /^\S+@\S+$/i, message: "Invalid Email" },
                })}
                error={errors.email?.message}
              />
            </div>
            <div className="form-group">
              <Input placeholder="Profession" {...register("profession")} />
            </div>
            <div className="form-group">
              <Input
                placeholder="Phone"
                {...register("phone", {
                  pattern: { value: /^[6-9]\d{9}$/, message: "Invalid Phone Number" },
                })}
                error={errors.phone?.message}
              />
            </div>
            <div className="form-group">
              <Input placeholder="Bio" {...register("bio")} />
            </div>
            <div className="form-group">
              <Input
                placeholder="Password"
                type="password"
                {...register("password", {
                  required: "Password required",
                  minLength: { value: 8, message: "Minimum 8 characters" },
                })}
                error={errors.password?.message}
              />
            </div>
            <div className="form-group">
              <Input
                placeholder="Confirm Password"
                type="password"
                {...register("confirmPassword", {
                  validate: (value) => value === password || "Passwords do not match",
                })}
                error={errors.confirmPassword?.message}
              />
            </div>

            <PasswordStrength password={password} />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="register-footer">
            Already have an account?{" "}
            <Link to="/login">Login</Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

function PasswordStrength({ password }) {
  if (!password) {
    return null;
  }
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const labels = ["Very Weak", "Weak", "Good", "Strong"];
  return (
    <div className="password-strength">
      <div className="strength-bar">
        <div
          className={`strength-fill strength-${score}`}
          style={{ width: `${score * 25}%` }}
        ></div>
      </div>
      <p>
        Password Strength : <b> {labels[score - 1] || "Very Weak"}</b>
      </p>
    </div>
  );
}