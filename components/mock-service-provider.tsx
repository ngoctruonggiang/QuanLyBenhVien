"use client";

import { useEffect } from "react";

export function MockServiceProvider() {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_API_MOCK !== "true") return;
    if (typeof window === "undefined") return;
    import("../mocks/browser")
      .then(({ worker }) =>
        worker.start({
          onUnhandledRequest: "bypass",
        }),
      )
      .catch((err) => {
        console.error("MSW worker failed to start", err);
      });
  }, []);

  return null;
}
