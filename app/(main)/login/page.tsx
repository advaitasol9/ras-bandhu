"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser, useAuth } from "reactfire";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";
import Loader from "@/components/ui/loader";

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
  }
}

const formSchema = z.object({
  phoneNumber: z
    .string()
    .length(10, { message: "Phone number must be exactly 10 digits" })
    .regex(/^[0-9]+$/, { message: "Phone number must contain only digits" }),
  otp: z.string().optional(),
});

const LoginPage = () => {
  const { data: user } = useUser();
  const router = useRouter();

  const auth = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [timer, setTimer] = useState(30); // 30 seconds countdown

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phoneNumber: "",
      otp: "",
    },
  });

  const initializeRecaptcha = () => {
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear(); // Clear the previous instance
    }

    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "invisible",
        callback: () => {
          console.log("Recaptcha verified");
        },
      }
    );

    window.recaptchaVerifier.render(); // Render the recaptcha again

    return window.recaptchaVerifier;
  };

  const handleSendOtp = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      const recaptchaVerifier = initializeRecaptcha();
      const result = await signInWithPhoneNumber(
        auth,
        `+91${data.phoneNumber}`,
        recaptchaVerifier
      );
      setConfirmationResult(result);
      setOtpSent(true);
      setResendDisabled(true); // Disable resend initially
      setTimer(30); // Reset timer to 30 seconds

      toast({
        title: "OTP Sent!",
        description: "Check your phone for the verification code.",
      });
    } catch (error) {
      console.log("send otp error", error);
      toast({ title: "Error Sending OTP", description: "Could not send OTP" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    const data = form.getValues();
    await handleSendOtp(data);
  };

  const handleVerifyOtp = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      if (!confirmationResult) {
        throw new Error("OTP not sent");
      }

      await confirmationResult.confirm(data.otp || "");
      toast({
        title: "Success!",
        description: "You have been signed in.",
      });
    } catch (error) {
      toast({ title: "Error Verifying OTP", description: "Invalid OTP" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      router.push("/app");
    }
  }, [user]);

  // Timer for resend button
  useEffect(() => {
    let countdown: any;
    if (otpSent && resendDisabled) {
      countdown = setInterval(() => {
        setTimer((prev) => {
          if (prev === 1) {
            clearInterval(countdown);
            setResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(countdown);
  }, [otpSent, resendDisabled]);

  return (
    <div className="grow flex flex-col items-center justify-center">
      <section className="space-y-4 w-[20rem] md:w-[32rem]">
        <Card className="bg-[rgb(var(--card))] shadow-lg rounded-lg">
          <CardHeader>
            <CardTitle className="text-[rgb(var(--primary-text))] text-xl font-semibold">
              {otpSent ? "Verify OTP" : "Sign In with Phone"}
            </CardTitle>
            <CardDescription className="text-[rgb(var(--secondary-text))]">
              Get started now
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(
                  otpSent ? handleVerifyOtp : handleSendOtp
                )}
                className="space-y-6"
              >
                {!otpSent && (
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[rgb(var(--primary-text))] font-medium">
                          Phone Number
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            {...field}
                            placeholder="Enter 10 digit mobile number"
                            className="border border-[rgb(var(--input))] focus:ring-[rgb(var(--primary))] focus:border-[rgb(var(--primary))] rounded-md"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {otpSent && (
                  <FormField
                    control={form.control}
                    name="otp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[rgb(var(--primary-text))] font-medium">
                          Enter OTP
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            {...field}
                            placeholder="Enter the OTP"
                            className="border border-[rgb(var(--input))] focus:ring-[rgb(var(--primary))] focus:border-[rgb(var(--primary))] rounded-md"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {isLoading ? (
                  <Loader />
                ) : (
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[rgb(var(--primary))] text-[rgb(var(--button-text))] hover:bg-[rgb(var(--primary-foreground))] transition-colors duration-300"
                  >
                    {otpSent ? "Verify OTP" : "Send OTP"}
                  </Button>
                )}
              </form>
            </Form>

            {otpSent && (
              <div className="mt-4 flex justify-between items-center">
                <button
                  disabled={resendDisabled}
                  onClick={handleResendOtp}
                  className={`text-sm font-medium ${
                    resendDisabled
                      ? "text-[rgb(var(--muted-foreground))]"
                      : "text-[rgb(var(--primary))] hover:underline"
                  }`}
                >
                  {resendDisabled
                    ? `Didn't receive OTP? Resend in ${timer}s`
                    : "Didn't receive OTP? Resend"}
                </button>
              </div>
            )}

            <div id="recaptcha-container"></div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default LoginPage;
