"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Hotel, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";

const PasswordResetPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSubmittedEmail(email);
      setShowConfirmation(true);
    } catch (error) {
      setErrorMessage("Failed to send reset link. Please try again.");
      console.error("Password reset error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTryAgain = () => {
    setShowConfirmation(false);
    setEmail("");
    setSubmittedEmail("");
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background with gradients */}
      <div className="absolute inset-0 bg-white" />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 30%, rgba(125, 211, 252, 1) 0%, rgba(94, 158, 189, 0.75) 12.5%, rgba(63, 106, 126, 0.5) 25%, rgba(31, 53, 63, 0.25) 37.5%, rgba(0, 0, 0, 0) 50%), radial-gradient(circle at 80% 70%, rgba(20, 184, 166, 1) 0%, rgba(15, 138, 125, 0.75) 12.5%, rgba(10, 92, 83, 0.5) 25%, rgba(5, 46, 42, 0.25) 37.5%, rgba(0, 0, 0, 0) 50%)`,
        }}
      />

      {/* Main content container */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-5">
        {/* Header with icon and title */}
        <div className="flex flex-col items-center gap-4">
          <div className="bg-sky-600 rounded-3xl shadow-[0px_1px_4px_0px_rgba(0,0,0,0.15)] w-14 h-14 flex items-center justify-center">
            <Hotel className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-base font-normal text-neutral-950 tracking-[-0.3125px] text-center">
            Hospital Management System
          </h1>
        </div>

        {/* Conditional rendering based on showConfirmation state */}
        {!showConfirmation ? (
          /* Password Reset Card - Email Input */
          <div className="w-full max-w-[416px] bg-[rgba(255,255,255,0.95)] border border-[rgba(0,0,0,0.1)] rounded-[14px] shadow-sm">
            {/* Card Header */}
            <div className="px-6 pt-6 pb-0">
              <h2 className="text-base font-medium text-neutral-950 tracking-[-0.3125px] text-center mb-1.5">
                Reset Password
              </h2>
              <p className="text-base font-normal text-[#717182] tracking-[-0.3125px] text-center">
                Enter your email address and we&apos;ll send you a reset link
              </p>
            </div>

            {/* Card Content - Form */}
            <div className="px-6 py-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Error Message */}
                {errorMessage && (
                  <div className="bg-error-100 border border-error-600 text-error-600 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                    <span className="shrink-0 mt-0.5">⚠️</span>
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Email Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-neutral-950 tracking-[-0.1504px]"
                  >
                    Email Address
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-9 bg-[#f3f3f5] border-transparent rounded-lg px-3 py-1 text-sm tracking-[-0.1504px] placeholder:text-[#717182]"
                    placeholder="your.email@hospital.com"
                    disabled={isLoading}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full h-9 bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium tracking-[-0.1504px] rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
            </div>

            {/* Card Footer */}
            <div className="border-t border-[#e0e0e0] px-6 py-6 flex flex-col items-center">
              <button
                onClick={() => router.push("/login")}
                className="flex items-center gap-2 text-base font-normal text-sky-600 hover:text-sky-700 tracking-[-0.1504px] transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Sign In
              </button>
            </div>
          </div>
        ) : (
          /* Check Your Email Card - Confirmation */
          <div className="w-full max-w-[416px] bg-[rgba(255,255,255,0.95)] border border-[rgba(0,0,0,0.1)] rounded-[14px] shadow-sm">
            {/* Card Header */}
            <div className="px-6 pt-6 pb-0">
              <h2 className="text-base font-medium text-neutral-950 tracking-[-0.3125px] text-center mb-1.5">
                Check Your Email
              </h2>
              <p className="text-base font-normal text-[#717182] tracking-[-0.3125px] text-center">
                We&apos;ve sent a password reset link to your email address
              </p>
            </div>

            {/* Card Content */}
            <div className="px-6 py-6">
              <div className="space-y-4">
                {/* Info Box */}
                <div className="bg-[#e6f0fa] rounded-lg px-4 py-3">
                  <p className="text-sm font-normal text-[#0d47a1]">
                    If an account exists for{" "}
                    <span className="font-semibold">{submittedEmail}</span>, you
                    will receive a password reset link shortly.
                  </p>
                </div>

                {/* Try Again Section */}
                <div className="space-y-2">
                  <p className="text-sm font-normal text-[#717182] tracking-[-0.1504px] text-center">
                    Didn&apos;t receive the email?
                  </p>
                  <button
                    onClick={handleTryAgain}
                    className="w-full h-9 bg-white border border-sky-600 text-sky-600 text-sm font-medium tracking-[-0.1504px] rounded-lg transition-colors duration-200 hover:bg-sky-50"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="border-t border-[rgba(0,0,0,0.1)] px-6 py-6 flex flex-col items-center">
              <button
                onClick={() => router.push("/login")}
                className="flex items-center gap-2 text-sm font-medium text-sky-600 hover:text-sky-700 tracking-[-0.1504px] transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Sign In
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PasswordResetPage;
