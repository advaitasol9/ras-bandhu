"use client";

import { useEffect } from "react";
import { useUserContext } from "@/components/context/user-provider";
import { useRouter } from "next/navigation";

const UserRoute = ({ children }: any) => {
  const { isMentor, isAdmin, user, userData, loading, appData } =
    useUserContext();
  const router = useRouter();

  useEffect(() => {
    if (loading || !appData) return;

    if (!user) router.push("/login");
    else if (isMentor) router.replace("/mentor");
    else if (isAdmin) router.replace("/admin");
    else {
      if (
        userData &&
        (!userData?.name || !userData?.email || !userData?.phone)
      ) {
        router.replace("/app/profile");
      }
    }
  }, [isMentor, isAdmin, userData, user, router, loading, appData]);

  return <>{children}</>;
};

export default UserRoute;
