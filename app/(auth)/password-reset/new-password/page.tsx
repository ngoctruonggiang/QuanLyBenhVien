"use client";

import { useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Hotel, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";

const ResetPasswordPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token"); // Get token from URL

  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Password validation state
  const [validations, setValidations] = useState({
    minLength: false,
    hasUpperLower: false,
    hasNumber: false,
    hasSpecial: false,
  });

  const validatePassword = (password: string) => {
    setValidations({
      minLength: password.length >= 8,
      hasUpperLower: /[a-z]/.test(password) && /[A-Z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  };

  const handlePasswordChange = (
    field: "newPassword" | "confirmPassword",
    value: string
  ) => {
    setPasswords((prev) => ({ ...prev, [field]: value }));
    if (field === "newPassword") {
      validatePassword(value);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");

    // Validate passwords match
    if (passwords.newPassword !== passwords.confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    // Validate all requirements are met
    if (!Object.values(validations).every((v) => v)) {
      setErrorMessage("Please meet all password requirements");
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call to reset password
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Redirect to login with success message
      router.push("/login?reset=success");
    } catch (error) {
      setErrorMessage("Failed to reset password. Please try again.");
      console.error("Password reset error:", error);
    } finally {
      setIsLoading(false);
    }
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

        {/* Reset Password Card */}
        <div className="w-full max-w-[416px] bg-[rgba(255,255,255,0.95)] border border-[rgba(0,0,0,0.1)] rounded-[14px] shadow-sm">
          {/* Card Header */}
          <div className="px-6 pt-6 pb-0">
            <h2 className="text-base font-medium text-neutral-950 tracking-[-0.3125px] text-center mb-1.5">
              Reset Your Password
            </h2>
            <p className="text-base font-normal text-[#717182] tracking-[-0.3125px] text-center">
              Please enter your new password below
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

              {/* New Password Field */}
              <div className="space-y-2">
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-neutral-950 tracking-[-0.1504px]"
                >
                  New Password
                </label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={passwords.newPassword}
                    onChange={(e) =>
                      handlePasswordChange("newPassword", e.target.value)
                    }
                    className="h-9 bg-[#f3f3f5] border-transparent rounded-lg px-3 py-1 pr-10 text-sm tracking-[-0.1504px] placeholder:text-[#717182]"
                    placeholder="Enter your new password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    disabled={isLoading}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4 text-[#717182] hover:text-neutral-950" />
                    ) : (
                      <Eye className="h-4 w-4 text-[#717182] hover:text-neutral-950" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-neutral-950 tracking-[-0.1504px]"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={passwords.confirmPassword}
                    onChange={(e) =>
                      handlePasswordChange("confirmPassword", e.target.value)
                    }
                    className="h-9 bg-[#f3f3f5] border-transparent rounded-lg px-3 py-1 pr-10 text-sm tracking-[-0.1504px] placeholder:text-[#717182]"
                    placeholder="Re-enter your new password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-[#717182] hover:text-neutral-950" />
                    ) : (
                      <Eye className="h-4 w-4 text-[#717182] hover:text-neutral-950" />
                    )}
                  </button>
                </div>
              </div>

              {/* Password Requirements Box */}
              <div className="bg-[#e6f0fa] rounded-lg px-4 py-3">
                <p className="text-xs font-normal text-[#0d47a1] pb-2">
                  Password must contain:
                </p>
                <ul className="space-y-1">
                  <li className="flex items-center gap-2 text-xs text-[#0d47a1]">
                    <span
                      className={
                        validations.minLength ? "opacity-100" : "opacity-40"
                      }
                    >
                      {validations.minLength ? "●" : "○"}
                    </span>
                    <span>At least 8 characters</span>
                  </li>
                  <li className="flex items-center gap-2 text-xs text-[#0d47a1]">
                    <span
                      className={
                        validations.hasUpperLower ? "opacity-100" : "opacity-40"
                      }
                    >
                      {validations.hasUpperLower ? "●" : "○"}
                    </span>
                    <span>Uppercase and lowercase letters</span>
                  </li>
                  <li className="flex items-center gap-2 text-xs text-[#0d47a1]">
                    <span
                      className={
                        validations.hasNumber ? "opacity-100" : "opacity-40"
                      }
                    >
                      {validations.hasNumber ? "●" : "○"}
                    </span>
                    <span>At least one number</span>
                  </li>
                  <li className="flex items-center gap-2 text-xs text-[#0d47a1]">
                    <span
                      className={
                        validations.hasSpecial ? "opacity-100" : "opacity-40"
                      }
                    >
                      {validations.hasSpecial ? "●" : "○"}
                    </span>
                    <span>At least one special character</span>
                  </li>
                </ul>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full h-9 bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium tracking-[-0.1504px] rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? "Resetting Password..." : "Reset Password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
