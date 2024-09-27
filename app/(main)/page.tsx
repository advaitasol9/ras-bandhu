"use client";

import React, { useEffect } from "react";
import DailyEvalPlans from "@/components/plans-functional/daily-eval-plans";
import HowItWorks from "@/components/home/how-it-works";
import AboutUs from "@/components/home/about-us";
import { useRouter } from "next/navigation";
import { useUserContext } from "@/components/context/user-provider";
import Intro from "@/components/home/intro";

export default function Home() {
  const router = useRouter();
  const { user, isMentor } = useUserContext();

  useEffect(() => {
    if (user) {
      if (isMentor) router.replace("/mentor");
      else router.replace("/app");
    }
  }, [user, isMentor]);

  return (
    <div className="w-full">
      <Intro />
      <HowItWorks />
      <DailyEvalPlans />
      {/* <TryForFree /> */}
      <AboutUs />
    </div>
  );
}
