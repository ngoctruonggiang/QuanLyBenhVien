"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Hospital } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { mockAuthService } from "@/services/auth.mock.service";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import z from "zod";

export const signupSchema = z
  .object({
    username: z.string().min(1, "Username is required"),
    email: z.email({ message: "Invalid email address" }),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Confirm Password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignUpCredentials = z.infer<typeof signupSchema>;

const SignUpPage = () => {
  const router = useRouter();
  const [credentials, setCredentials] = useState<SignUpCredentials>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");

    // Validation
    if (credentials.password !== credentials.confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    if (credentials.password.length < 6) {
      setErrorMessage("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    try {
      const response = await mockAuthService.signup({
        username: credentials.username,
        email: credentials.email,
        password: credentials.password,
      });

      // Store tokens in localStorage
      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);
      localStorage.setItem("userEmail", response.email);
      localStorage.setItem("userRole", response.role);

      // Redirect to admin dashboard after successful signup
      router.push("/admin");
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Failed to create account. Please try again.");
      }
      console.error("Signup error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    // TODO: Implement Google OAuth signup
    console.log("Google signup clicked");
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
            <Hospital className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-base font-normal text-neutral-950 tracking-[-0.3125px] text-center">
            Hospital Management System
          </h1>
        </div>

        {/* Signup Card */}
        <Card className="w-full max-w-[416px] bg-[rgba(255,255,255,0.95)] border border-[rgba(0,0,0,0.1)] rounded-[14px] shadow-sm gap-0 py-0">
          {/* Card Header */}
          <CardHeader className="px-6 pt-6 pb-0">
            <CardTitle className="text-base font-medium text-neutral-950 tracking-[-0.3125px] text-center">
              Welcome
            </CardTitle>
            <CardDescription className="text-base font-normal text-[#717182] tracking-[-0.3125px] text-center">
              Enter your credentials to register
            </CardDescription>
          </CardHeader>

          {/* Card Content - Form */}
          <CardContent className="px-6 py-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Message */}
              {errorMessage && (
                <div className="bg-red-50 border border-red-600 text-red-600 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                  <span className="shrink-0 mt-0.5">⚠️</span>
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Username Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="username"
                  className="text-sm font-medium text-neutral-950 tracking-[-0.1504px]"
                >
                  Username
                </Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={credentials.username}
                  onChange={(e) =>
                    setCredentials({
                      ...credentials,
                      username: e.target.value,
                    })
                  }
                  className="h-9 bg-[#f3f3f5] border-transparent rounded-lg px-3 py-1 text-sm tracking-[-0.1504px] placeholder:text-[#717182]"
                  placeholder="Enter your username"
                  disabled={isLoading}
                />
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-neutral-950 tracking-[-0.1504px]"
                >
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={credentials.email}
                  onChange={(e) =>
                    setCredentials({
                      ...credentials,
                      email: e.target.value,
                    })
                  }
                  className="h-9 bg-[#f3f3f5] border-transparent rounded-lg px-3 py-1 text-sm tracking-[-0.1504px] placeholder:text-[#717182]"
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-neutral-950 tracking-[-0.1504px]"
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={credentials.password}
                    onChange={(e) =>
                      setCredentials({
                        ...credentials,
                        password: e.target.value,
                      })
                    }
                    className="h-9 bg-[#f3f3f5] border-transparent rounded-lg px-3 py-1 pr-10 text-sm tracking-[-0.1504px] placeholder:text-[#717182]"
                    placeholder="Enter your password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-[#717182] hover:text-neutral-950" />
                    ) : (
                      <Eye className="h-4 w-4 text-[#717182] hover:text-neutral-950" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-neutral-950 tracking-[-0.1504px]"
                >
                  Confirm password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={credentials.confirmPassword}
                    onChange={(e) =>
                      setCredentials({
                        ...credentials,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="h-9 bg-[#f3f3f5] border-transparent rounded-lg px-3 py-1 pr-10 text-sm tracking-[-0.1504px] placeholder:text-[#717182]"
                    placeholder="Confirm your password"
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

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-9 bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium tracking-[-0.1504px] rounded-lg transition-colors duration-200"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Sign up"}
              </Button>

              {/* Separator with OR */}
              <div className="relative flex items-center justify-center">
                <Separator className="absolute bg-[rgba(0,0,0,0.1)]" />
                <div className="relative bg-white px-2">
                  <span className="text-xs text-[#717182] uppercase">or</span>
                </div>
              </div>

              {/* Google Sign Up Button */}
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleSignup}
                className="w-full h-9 bg-white border border-[rgba(0,0,0,0.1)] hover:bg-gray-50 text-neutral-950 text-sm font-medium tracking-[-0.1504px] rounded-lg transition-colors duration-200"
                disabled={isLoading}
              >
                <svg
                  className="w-5 h-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M19.576 10.229c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.351z"
                    fill="#4285F4"
                  />
                  <path
                    d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.591A9.996 9.996 0 0010 20z"
                    fill="#34A853"
                  />
                  <path
                    d="M4.405 11.9c-.2-.6-.314-1.241-.314-1.9 0-.659.114-1.3.314-1.9V5.509H1.064A9.996 9.996 0 000 10c0 1.614.386 3.14 1.064 4.491L4.405 11.9z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.695 0 10 0 6.09 0 2.71 2.24 1.064 5.509L4.405 8.1C5.19 5.737 7.395 3.977 10 3.977z"
                    fill="#EA4335"
                  />
                </svg>
                Sign up with Google
              </Button>
            </form>
          </CardContent>

          {/* Card Footer */}
          <CardFooter className="border-t border-[rgba(0,0,0,0.1)] px-6 py-6 flex items-center justify-center">
            <p className="text-sm text-[#717182] tracking-[-0.1504px] text-center">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-sky-600 hover:text-sky-700"
              >
                Log in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SignUpPage;
