"use client";
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Github,
  Mail,
  Eye,
  EyeOff,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import useAuthStore from "@/store/authStore";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const { sendOTP, verifyOTP, register } = useAuthStore();

  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);

  // loading states
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    otp: "",
  });
  // Restore verified state if page refreshes
  useEffect(() => {
    const verifiedEmail = localStorage.getItem("otpVerifiedEmail");
    if (verifiedEmail && verifiedEmail === formData.email) {
      setOtpVerified(true);
      setStep(2);
    }
  }, [formData.email]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  /** Step 1: Send OTP */
  const handleSendOtp = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      return toast.error("Please fill all fields before continuing.");
    }
    if (formData.password.length < 6) {
      return toast.error("Password must be at least 6 characters.");
    }
    try {
      setIsSendingOtp(true);
      await sendOTP(formData.email);
      toast.success("OTP sent to email.");
      setOtpSent(true);
      setStep(2);
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.error || "Failed to send OTP. Please try again."
      );
      setOtpSent(false);
    } finally {
      setIsSendingOtp(false);
    }
  };

  /** Step 2: Verify OTP */
  const handleVerifyOtp = async () => {
    if (!formData.otp || formData.otp.length < 6) {
      return toast.error("Enter a valid 6-digit OTP.");
    }
    try {
      setIsVerifyingOtp(true);
      await verifyOTP(formData.email, formData.otp);

      setOtpVerified(true);
      localStorage.setItem("otpVerifiedEmail", formData.email);
      toast.success("OTP verified successfully!");
    } catch (error) {
      toast.error(
        error?.response?.data?.error || "Verification failed. Try again."
      );
      setOtpVerified(false);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  /** Step 3: Register */
  const handleRegister = async () => {
    if (!otpVerified) {
      return toast.error("Please verify your OTP before registering.");
    }
    try {
      setIsRegistering(true);
      const registerRes = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      console.log(registerRes);
      toast.success("Registered successfully!");
      localStorage.removeItem("otpVerifiedEmail");
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(
        error?.response?.data?.error || "Registration failed. Try again."
      );
    } finally {
      setIsRegistering(false);
    }
  };

  const handleBack = () => {
    setStep(1);
    setFormData((prev) => ({ ...prev, otp: "" }));
  };

  const isStepValid = () => {
    if (step === 1) {
      return formData.name && formData.email && formData.password.length >= 6;
    }
    if (step === 2 && !otpVerified) {
      return formData.otp.length === 6;
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50 dark:from-zinc-950 dark:via-blue-950/20 dark:to-indigo-950/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <CheckCircle className="w-8 h-8 text-white" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Create Account
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Join thousands of users already using our platform
          </p>
        </div>

        <Card className="border-0 shadow-xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-3xl overflow-hidden">
          {/* Progress Bar */}
          <div className="h-1 bg-gray-100 dark:bg-zinc-800">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500 ease-out"
              style={{ width: `${(step / 2) * 100}%` }}
            />
          </div>

          <CardHeader className="pb-6 pt-8">
            <div className="flex items-center justify-between">
              {step === 2 && (
                <button
                  onClick={handleBack}
                  className="flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back
                </button>
              )}
              <div className="flex-1 flex justify-center">
                <div className="flex space-x-2">
                  {[1, 2].map((s) => (
                    <div
                      key={s}
                      className={cn(
                        "w-3 h-3 rounded-full transition-all duration-300",
                        s <= step
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 scale-110"
                          : "bg-gray-200 dark:bg-zinc-700"
                      )}
                    />
                  ))}
                </div>
              </div>
              <div className="w-10" />
            </div>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            {step === 1 ? (
              <div className="space-y-6">
                {/* Step 1: Details */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Full Name
                    </label>
                    <Input
                      placeholder="Enter your full name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="h-12 rounded-xl border-gray-200 dark:border-zinc-700 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email Address
                    </label>
                    <Input
                      placeholder="Enter your email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="h-12 rounded-xl border-gray-200 dark:border-zinc-700 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Password
                    </label>
                    <div className="relative">
                      <Input
                        placeholder="Create a strong password"
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="h-12 rounded-xl pr-12 border-gray-200 dark:border-zinc-700 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" strokeWidth={1.5} />
                        ) : (
                          <Eye className="w-5 h-5" strokeWidth={1.5} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleSendOtp}
                  disabled={!isStepValid() || isSendingOtp}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSendingOtp ? "Sending OTP..." : "Continue"}
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Step 2: OTP */}
                <div className="text-center space-y-3">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl mb-2">
                    <Mail className="w-8 h-8 text-blue-600" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Verify your email
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    We've sent a 6-digit verification code to
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formData.email}
                  </p>
                </div>

                {!otpVerified && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Verification Code
                    </label>
                    <Input
                      placeholder="Enter 6-digit code"
                      name="otp"
                      value={formData.otp}
                      onChange={handleChange}
                      className="h-12 rounded-xl border-gray-200 dark:border-zinc-700 focus:border-blue-500 focus:ring-blue-500/20 transition-all text-center text-lg font-mono tracking-wider"
                      maxLength={6}
                    />
                  </div>
                )}

                <Button
                  onClick={otpVerified ? handleRegister : handleVerifyOtp}
                  disabled={
                    (!otpVerified && (!isStepValid() || isVerifyingOtp)) ||
                    isRegistering
                  }
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isVerifyingOtp
                    ? "Verifying..."
                    : isRegistering
                    ? "Registering..."
                    : otpVerified
                    ? "Register"
                    : "Verify OTP"}
                </Button>

                {!otpVerified && (
                  <div className="text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Didn't receive the code?{" "}
                      <button
                        onClick={handleSendOtp}
                        disabled={isSendingOtp}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium hover:underline transition-colors disabled:opacity-50"
                      >
                        {isSendingOtp ? "Resending..." : "Resend code"}
                      </button>
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Link
          to="/login"
          className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6"
        >
          Already have an account?{" "}
          <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium hover:underline transition-colors">
            Sign in
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Register;
