"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Admin Segment Error:", error);
  }, [error]);

  return (
    <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
        <AlertCircle className="h-10 w-10 text-red-600" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">
          Something went wrong!
        </h2>
        <p className="text-muted-foreground max-w-[500px]">
          {error.message ||
            "An unexpected error occurred while loading this segment."}
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button onClick={() => reset()} variant="default">
          Try again
        </Button>

        <Button onClick={() => router.push("/admin")} variant="outline">
          Go to Dashboard
        </Button>

        <Button onClick={() => router.back()} variant="ghost">
          Go Back
        </Button>
      </div>
    </div>
  );
}
