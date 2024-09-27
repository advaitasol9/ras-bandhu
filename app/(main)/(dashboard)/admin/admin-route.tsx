"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserContext } from "@/components/context/user-provider";

const AdminRoute = ({ children }: any) => {
  const { loading, user, isAdmin, appData } = useUserContext();
  const router = useRouter();

  useEffect(() => {
    if (loading || !appData) return;

    if (!user) {
      router.push("/login");
    } else if (!isAdmin) {
      router.push("/app");
    }
  }, [loading, appData, user, isAdmin, router]);

  if (loading || !appData) {
    return <div className="text-center">Loading...</div>;
  }

  return <>{children}</>;
};

export default AdminRoute;
