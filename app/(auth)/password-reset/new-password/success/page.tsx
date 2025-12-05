"use client";

import { useRouter } from "next/navigation";
import { Hotel, CheckCircle2 } from "lucide-react";

const ResetSuccessPage = () => {
  const router = useRouter();

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

        {/* Success Card */}
        <div className="w-full max-w-[416px] bg-[rgba(255,255,255,0.95)] border border-[rgba(0,0,0,0.1)] rounded-[14px] shadow-sm">
          {/* Card Header with Success Icon */}
          <div className="px-6 pt-6 pb-0">
            <div className="flex flex-col items-center gap-4">
              {/* Success Icon */}
              <div className="bg-[#e6f0fa] rounded-full w-16 h-16 flex items-center justify-center">
                <CheckCircle2
                  className="w-10 h-10 text-green-600"
                  strokeWidth={2}
                />
              </div>

              {/* Title */}
              <h2 className="text-base font-medium text-neutral-950 tracking-[-0.3125px] text-center mb-1.5">
                Password Reset Successful
              </h2>

              {/* Description */}
              <p className="text-base font-normal text-[#717182] tracking-[-0.3125px] text-center">
                Your password has been changed successfully
              </p>
            </div>
          </div>

          {/* Card Content */}
          <div className="px-6 py-6">
            <div className="space-y-4">
              {/* Info Box */}
              <div className="bg-[#e6f0fa] rounded-lg px-4 py-3">
                <p className="text-sm font-normal text-[#0d47a1] text-center">
                  You can now sign in with your new password
                </p>
              </div>

              {/* Go to Sign In Button */}
              <button
                onClick={() => router.push("/login")}
                className="w-full h-9 bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium tracking-[-0.1504px] rounded-lg transition-colors duration-200"
              >
                Go to Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetSuccessPage;
