"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUserContext } from "@/components/context/user-provider";

const CheckoutRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const { user } = useUserContext();
  const params = useParams();
  const planId = params?.id;

  useEffect(() => {
    if (!user || !user.uid) {
      router.replace("/login");
    }

    if (!planId) {
      router.replace("/app");
    }
  }, [user, planId, router]);

  return <>{user && planId ? children : null}</>;
};

export default CheckoutRoute;
