"use client";

import { NavbarMobile } from "@/components/navbar/navbar-mobile";
import { NavbarUserLinks } from "@/components/navbar/navbar-user-links";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { FC } from "react";
import Image from "next/image";
import { useUser } from "reactfire";
import { useUserContext } from "../context/user-provider";
import { useThemeContext } from "../context/theme-provider";
import { BsSun, BsMoon } from "react-icons/bs";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const DarkModeToggleButton = ({ isDarkMode, toggleDarkMode }: any) => {
  return (
    <div
      className="w-14 h-6 flex items-center bg-gray-300 dark:bg-gray-600 rounded-full p-1 cursor-pointer"
      onClick={toggleDarkMode}
    >
      <div
        className={`w-6 h-6 rounded-full transition-transform duration-300 flex items-center justify-center ${
          isDarkMode ? "translate-x-6 bg-yellow-500" : "bg-gray-800"
        }`}
      >
        {isDarkMode ? (
          <BsSun className="text-white w-4 h-4" />
        ) : (
          <BsMoon className="text-yellow-400 w-4 h-4" />
        )}
      </div>
    </div>
  );
};

export const NavBar: FC = () => {
  const { data, hasEmitted } = useUser();
  const { isMentor } = useUserContext();
  const { isDarkMode, toggleDarkMode } = useThemeContext();
  const pathname = usePathname();

  // Check if the link is active
  const isActive = (path: string) => pathname === path;

  return (
    <>
      <div className="animate-in fade-in w-full">
        <nav className="container px-2 md:px-8">
          <div className="flex items-center">
            <Link
              href={data && hasEmitted ? (isMentor ? "/mentor" : "/app") : "/"}
              className="hover:opacity-80 transition-opacity"
            >
              <div className="flex items-center">
                <Image
                  src={isDarkMode ? "/logo-dark.svg" : "/logo.svg"}
                  alt="logo"
                  width={180}
                  height={10}
                  className="mr-2"
                />
              </div>
            </Link>
            <div className="hidden lg:flex justify-between grow">
              <div>
                <Link
                  href="/daily-evaluation"
                  className={cn(
                    buttonVariants({ variant: "link" }),
                    isActive("/daily-evaluation")
                      ? "text-primary underline" // Highlight active link
                      : ""
                  )}
                >
                  Daily Evaluation
                </Link>
                <Link
                  href="/test-evaluation"
                  className={cn(
                    buttonVariants({ variant: "link" }),
                    isActive("/test-evaluation") ? "text-primary underline" : ""
                  )}
                >
                  Test Evaluation
                </Link>
                <Link
                  href="/contact-us"
                  className={cn(
                    buttonVariants({ variant: "link" }),
                    isActive("/contact-us") ? "text-primary underline" : ""
                  )}
                >
                  Contact Us
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                <DarkModeToggleButton
                  isDarkMode={isDarkMode}
                  toggleDarkMode={toggleDarkMode}
                />
                <NavbarUserLinks />
              </div>
            </div>
            <div className="grow lg:hidden flex justify-end items-center">
              <DarkModeToggleButton
                isDarkMode={isDarkMode}
                toggleDarkMode={toggleDarkMode}
              />
              <NavbarMobile />
            </div>
          </div>
        </nav>
      </div>
    </>
  );
};
