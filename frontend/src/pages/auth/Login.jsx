import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Mail, Lock } from "lucide-react";

import AuthService from "../../services/AuthService";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

import AuthLayout from "../../components/auth/layout/AuthLayout";
import GlassCard from "../../components/auth/ui/GlassCard";
import AuthInput from "../../components/auth/ui/AuthInput";
import GradientButton from "../../components/auth/ui/GradientButton";
import AuthHeader from "../../components/auth/ui/AuthHeader";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await AuthService.login(data);
      const result = response.data.data;

      login(
        {
          id: result.id,
          name: result.fullName,
          email: result.email,
          role: result.role
        },
        result.token
      );

      toast.success("Login Successful");
      navigate(result.role === "ADMIN" ? "/admin" : "/");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Login Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout

heroTitle="Where Conversations Meet Simplicity."

heroSubtitle="Built with Spring Boot, React, WebSockets, and modern cloud-ready architecture."

>
      <GlassCard>
      <AuthHeader

title="Welcome Back 👋"

subtitle="Sign in to continue to PingMe"

/>
        <form
          className="auth-form"
          onSubmit={handleSubmit(onSubmit)}
        >
          <AuthInput
            label="Email Address"
            placeholder="Enter your email"
            type="email"
            icon={<Mail size={18} />}
            error={errors.email?.message}
            {...register("email", {
              required: "Email is required"
            })}
          />

          <AuthInput
            label="Password"
            placeholder="Enter your password"
            type="password"
            icon={<Lock size={18} />}
            error={errors.password?.message}
            {...register("password", {
              required: "Password is required"
            })}
          />

          <div className="auth-form-options">
            <Link
              to="/forgot-password"
              className="auth-text-link"
            >
              Forgot Password?
            </Link>
          </div>

          <GradientButton
            type="submit"
            loading={loading}
          >
            Sign In
          </GradientButton>
        </form>

        <div className="auth-footer">
          <span>
            Don't have an account?
          </span>
          <Link
            to="/register"
            className="auth-text-link"
          >
            Create Account
          </Link>
        </div>
      </GlassCard>
    </AuthLayout>
  );
}