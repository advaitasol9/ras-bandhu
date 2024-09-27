"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserContext } from "@/components/context/user-provider";

const MentorRoute = ({ children }: any) => {
  const { loading, user, isMentor, appData } = useUserContext();
  const router = useRouter();

  useEffect(() => {
    if (loading || !appData) return;

    if (!user) {
      router.push("/login");
    } else if (!isMentor) {
      router.push("/app");
    }
  }, [loading, appData, user, isMentor, router]);

  if (loading || !appData) {
    return <div className="text-center">Loading...</div>;
  }

  return <>{children}</>;
};

export default MentorRoute;
