"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";

export default function HomePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Ensure userId exists
    if (!localStorage.getItem("userId")) {
      localStorage.setItem("userId", uuidv4());
    }
    setReady(true);
  }, []);

  function handleStart(message: string) {
    // Store the initial message so chat page can send it on mount
    sessionStorage.setItem("pendingMessage", message);
    router.push("/chat");
  }

  if (!ready) return null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "calc(100vh - 56px)",
      }}
    >
      <OnboardingFlow onStart={handleStart} />
    </div>
  );
}
