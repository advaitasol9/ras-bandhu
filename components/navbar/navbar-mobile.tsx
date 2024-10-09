"use client";

import { NavbarUserLinks } from "@/components/navbar/navbar-user-links";
import { buttonVariants } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { MenuIcon } from "lucide-react";

export const NavbarMobile = () => {
  return (
    <>
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger className="-mr-4">
              <MenuIcon className="text-primary-text" />
            </NavigationMenuTrigger>
            <NavigationMenuContent className="flex flex-col p-1 bg-background">
              <NavigationMenuLink
                href="/daily-evaluation"
                className={buttonVariants({ variant: "link" })}
              >
                Daily Evaluation
              </NavigationMenuLink>
              <NavigationMenuLink
                href="/test-evaluation"
                className={buttonVariants({ variant: "link" })}
              >
                Test Evaluation
              </NavigationMenuLink>
              <NavigationMenuLink
                href="/contact-us"
                className={buttonVariants({ variant: "link" })}
              >
                Contact Us
              </NavigationMenuLink>
              <div className="flex flex-col mb-0.5">
                <NavbarUserLinks />
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </>
  );
};
