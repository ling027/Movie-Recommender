"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import styles from "./page.module.css";

export default function HomePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("userId")) {
      localStorage.setItem("userId", uuidv4());
    }
    setReady(true);
  }, []);

  function handleStart(message: string) {
    sessionStorage.setItem("pendingMessage", message);
    router.push("/chat");
  }

  if (!ready) return null;

  return (
    <div className={styles.wrapper}>
      <OnboardingFlow onStart={handleStart} />
    </div>
  );
}
