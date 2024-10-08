import type { Metadata } from "next";
import { Work_Sans } from "next/font/google";
import "@/app/globals.css";
import { cn } from "@/lib/utils";
import { MyFirebaseProvider } from "@/components/context/firebase-providers";
import { Toaster } from "@/components/ui/toaster";
import { ReactNode, Suspense } from "react";
import { UserProvider } from "@/components/context/user-provider";
import { ThemeProvider } from "@/components/context/theme-provider"; // Import the ThemeProvider
import { SubscriptionPlansProvider } from "@/components/context/subscription-provider";
import { DailyEvaluationProvider } from "@/components/context/daily-eval-provider";
import { TestEvaluationProvider } from "@/components/context/test-eval-provider";
import AlertProvider from "@/components/ui/alert-provider";

const font = Work_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RAS Bandhu",
  description:
    "RAS Bandhu is an online platform designed to support RAS aspirants in achieving their Civil Services goals.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={cn(font.className)}>
        <MyFirebaseProvider>
          <SubscriptionPlansProvider>
            <UserProvider>
              <DailyEvaluationProvider>
                <TestEvaluationProvider>
                  <ThemeProvider>
                    <Suspense>{children}</Suspense>
                    <Toaster />
                    <AlertProvider />
                  </ThemeProvider>
                </TestEvaluationProvider>
              </DailyEvaluationProvider>
            </UserProvider>
          </SubscriptionPlansProvider>
        </MyFirebaseProvider>
      </body>
    </html>
  );
}
