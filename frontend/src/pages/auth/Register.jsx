import "./Register.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { BriefcaseBusiness, Mail, Phone, UserRound, PenLine } from "lucide-react";
import toast from "react-hot-toast";

import AuthService from "../../services/AuthService";
import AuthLayout from "../../components/auth/layout/AuthLayout";
import GlassCard from "../../components/auth/ui/GlassCard";
import AuthHeader from "../../components/auth/ui/AuthHeader";
import AuthInput from "../../components/auth/ui/AuthInput";
import GradientButton from "../../components/auth/ui/GradientButton";
import JoiningIllustration from "../../components/auth/layout/JoiningIllustration";

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await AuthService.register({
        fullName: data.fullName,
        email: data.email,
        profession: data.profession,
        phone: data.phone,
        bio: data.bio,
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
    <AuthLayout className="auth-shell-register" illustration={JoiningIllustration} mobileMessage="Your circle starts here">
      <GlassCard className="register-auth-card">
        <AuthHeader
          title="Join PingMe 🚀"
          subtitle="Create your profile, meet your people, and make every message count."
          info="Your profile is protected and reviewed securely."
        />

        <form className="auth-form register-auth-form" onSubmit={handleSubmit(onSubmit)}>
          <AuthInput
            label="Full name"
            placeholder="How should people know you?"
            icon={<UserRound size={18} />}
            error={errors.fullName?.message}
            entranceDelay={.05}
            {...register("fullName", { required: "Full Name is required" })}
          />
          <AuthInput
            label="Email address"
            placeholder="you@example.com"
            type="email"
            icon={<Mail size={18} />}
            error={errors.email?.message}
            entranceDelay={.1}
            {...register("email", {
              required: "Email is required",
              pattern: { value: /^\S+@\S+$/i, message: "Invalid Email" },
            })}
          />
          <div className="register-auth-grid">
            <AuthInput
              label="Profession"
              placeholder="Designer, developer…"
              icon={<BriefcaseBusiness size={17} />}
              entranceDelay={.15}
              {...register("profession")}
            />
            <AuthInput
              label="Phone"
              placeholder="10-digit number"
              type="tel"
              icon={<Phone size={17} />}
              error={errors.phone?.message}
              entranceDelay={.2}
              {...register("phone", {
                pattern: { value: /^[6-9]\d{9}$/, message: "Invalid Phone Number" },
              })}
            />
          </div>
          <AuthInput
            label="A little about you"
            placeholder="Tell your future connections something…"
            icon={<PenLine size={17} />}
            entranceDelay={.25}
            {...register("bio")}
          />

          <GradientButton type="submit" loading={loading} loadingText="Creating Account...">
            Create Account
          </GradientButton>
        </form>

        <div className="auth-footer register-auth-footer">
          <span>Already part of PingMe?</span>
          <Link to="/login" className="auth-text-link">Sign In</Link>
        </div>
      </GlassCard>
    </AuthLayout>
  );
}
