"use client";

import { UserNav } from "@/components/navbar/user-nav";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { FC } from "react";
import { useUser } from "reactfire";
import { useUserContext } from "../context/user-provider";

export const NavbarUserLinks: FC = () => {
  const { data, hasEmitted } = useUser();
  const { isMentor, isAdmin } = useUserContext();

  return (
    <>
      {hasEmitted && data ? (
        <>
          <Link
            href={(isMentor && "/mentor") || (isAdmin && "/admin") || "/app"}
            className={buttonVariants()}
          >
            Dashboard
          </Link>
          <UserNav />
        </>
      ) : (
        <>
          <Link href="/login" className={buttonVariants()}>
            Login / Register &rarr;
          </Link>
        </>
      )}
    </>
  );
};
