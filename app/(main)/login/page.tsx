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
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  EmailAuthProvider,
  signInWithEmailAndPassword,
  linkWithCredential,
  fetchSignInMethodsForEmail,
  updatePassword,
} from "firebase/auth";
import Loader from "@/components/ui/loader";
import { OrSeparator } from "@/components/ui/or-separator";
import { ProviderLoginButtons } from "@/components/auth/provider-login-buttons";

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
  }
}

const LoginPage = () => {
  const { data: user } = useUser();
  const router = useRouter();
  const auth = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [stage, setStage] = useState<
    "PHONE_INPUT" | "PASSWORD_INPUT" | "OTP_VERIFICATION" | "SET_PASSWORD"
  >("PHONE_INPUT");
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [timer, setTimer] = useState(30); // 30 seconds countdown

  // Form fields
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  // Error messages
  const [errorMessage, setErrorMessage] = useState("");

  const initializeRecaptcha = () => {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-div", {
      size: "invisible",
      callback: () => {
        console.log("Recaptcha verified");
      },
    });
    window.recaptchaVerifier.render(); // Render the recaptcha again
    return window.recaptchaVerifier;
  };

  // Handle Proceed (after entering phone number)
  const handleProceed = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      if (!phoneNumber.match(/^[0-9]{10}$/)) {
        setErrorMessage("Please enter a valid 10-digit phone number.");
        return;
      }
      const dummyEmail = `${phoneNumber}@rasbandhu.com`;

      // Check if account exists
      const signInMethods = await fetchSignInMethodsForEmail(auth, dummyEmail);

      if (signInMethods.length > 0) {
        // Account exists, prompt for password
        setStage("PASSWORD_INPUT");
        toast({
          title: "Account Found",
          description: "Please enter your password.",
        });
      } else {
        // Account does not exist, proceed to OTP verification
        await handleSendOtp();
      }
    } catch (error: any) {
      console.error("Error during proceed:", error);
      toast({
        title: "Error",
        description: error.message || "An error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle sending OTP
  const handleSendOtp = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const recaptchaVerifier = window?.recaptchaVerifier
        ? window.recaptchaVerifier
        : initializeRecaptcha();
      const result = await signInWithPhoneNumber(
        auth,
        `+91${phoneNumber}`,
        recaptchaVerifier
      );
      setConfirmationResult(result);
      setStage("OTP_VERIFICATION");
      setResendDisabled(true);
      setTimer(30);

      toast({
        title: "OTP Sent!",
        description: "Check your phone for the verification code.",
      });
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      toast({
        title: "Error Sending OTP",
        description: error.message || "Could not send OTP.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP Verification
  const handleVerifyOtp = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      if (!otp.match(/^[0-9]{6}$/)) {
        setErrorMessage("Please enter a valid 6-digit OTP.");
        return;
      }
      if (!confirmationResult) {
        throw new Error("OTP not sent.");
      }

      const result = await confirmationResult.confirm(otp);
      const currentUser = result.user;

      // After OTP verification, prompt user to set a new password
      setStage("SET_PASSWORD");
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      toast({
        title: "Error Verifying OTP",
        description: error.message || "Invalid OTP.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Setting or Updating Password
  const handleSetPassword = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      if (password.length < 6) {
        setErrorMessage("Password must be at least 6 characters long.");
        return;
      }

      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("No authenticated user found.");
      }

      const dummyEmail = `${phoneNumber}@rasbandhu.com`;

      // Check if email/password provider is already linked
      const providerData = currentUser.providerData;
      const hasPasswordProvider = providerData.some(
        (provider) => provider.providerId === EmailAuthProvider.PROVIDER_ID
      );

      if (hasPasswordProvider) {
        // Email/password provider is already linked, update the password
        await updatePassword(currentUser, password);

        toast({
          title: "Success!",
          description: "Your password has been updated.",
        });
      } else {
        // Email/password provider is not linked, link it
        // Create email credential
        const credential = EmailAuthProvider.credential(dummyEmail, password);

        // Link email/password credential to the current user
        await linkWithCredential(currentUser, credential);

        toast({
          title: "Success!",
          description: "Your password has been set.",
        });
      }

      // Redirect to the app
      router.push("/app");
    } catch (error: any) {
      console.error("Error setting password:", error);

      // Handle specific error codes if needed
      if (error.code === "auth/requires-recent-login") {
        // Prompt the user to re-authenticate
        toast({
          title: "Session Expired",
          description: "Please log in again to update your password.",
        });
        // Sign the user out and redirect to the login page
        await auth.signOut();
        router.push("/login");
      } else {
        toast({
          title: "Error Setting Password",
          description: error.message || "Could not set password.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Login with Password
  const handleLoginWithPassword = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      if (password.length < 6) {
        setErrorMessage("Password must be at least 6 characters long.");
        return;
      }
      const dummyEmail = `${phoneNumber}@rasbandhu.com`;

      await signInWithEmailAndPassword(auth, dummyEmail, password);

      toast({
        title: "Welcome Back!",
        description: "You have been signed in.",
      });
      router.push("/app");
    } catch (error: any) {
      console.error("Error logging in:", error);
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Resending OTP
  const handleResendOtp = async () => {
    await handleSendOtp();
  };

  // Redirect if user is already authenticated
  useEffect(() => {
    if (user && stage == "PHONE_INPUT") {
      router.push("/app");
    }
  }, [user, router, stage]);

  // Timer for resend button
  useEffect(() => {
    let countdown: NodeJS.Timeout | null = null;
    if (stage === "OTP_VERIFICATION" && resendDisabled) {
      countdown = setInterval(() => {
        setTimer((prev) => {
          if (prev === 1) {
            if (countdown) clearInterval(countdown);
            setResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (countdown) clearInterval(countdown);
    };
  }, [stage, resendDisabled]);

  // Render form fields based on the current stage
  const renderFormFields = () => {
    switch (stage) {
      case "PHONE_INPUT":
        return (
          <>
            <div>
              <label htmlFor="phoneNumber" className="text-primary-text">
                Phone Number
              </label>
              <Input
                type="tel"
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter 10-digit mobile number"
                aria-label="Phone Number"
                className="border border-input focus:ring-primary focus:border-primary rounded-md"
              />
            </div>
            {errorMessage && <p className="text-destructive">{errorMessage}</p>}
            {isLoading ? (
              <Loader />
            ) : (
              <Button
                onClick={handleProceed}
                disabled={isLoading}
                className="w-full bg-primary text-button-text hover:bg-primary-foreground transition-colors duration-300"
              >
                Proceed
              </Button>
            )}
          </>
        );
      case "PASSWORD_INPUT":
        return (
          <>
            <div>
              <label htmlFor="password" className="text-primary-text">
                Password
              </label>
              <Input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                aria-label="Password"
                className="border border-input focus:ring-primary focus:border-primary rounded-md"
              />
            </div>
            {errorMessage && <p className="text-destructive">{errorMessage}</p>}
            {isLoading ? (
              <Loader />
            ) : (
              <Button
                onClick={handleLoginWithPassword}
                disabled={isLoading}
                className="w-full bg-primary text-button-text hover:bg-primary-foreground transition-colors duration-300"
              >
                Sign In
              </Button>
            )}
            <div className="text-sm text-center mt-2">
              <button
                onClick={async () => {
                  await handleSendOtp();
                }}
                className="text-primary-text hover:underline"
              >
                Forgot Password? Login using OTP
              </button>
            </div>
          </>
        );
      case "OTP_VERIFICATION":
        return (
          <>
            <div>
              <label htmlFor="otp" className="text-primary-text">
                Enter OTP
              </label>
              <Input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter the OTP"
                aria-label="OTP"
                className="border border-input focus:ring-primary focus:border-primary rounded-md"
              />
            </div>
            {errorMessage && <p className="text-destructive">{errorMessage}</p>}
            {isLoading ? (
              <Loader />
            ) : (
              <Button
                onClick={handleVerifyOtp}
                disabled={isLoading}
                className="w-full bg-primary text-button-text hover:bg-primary-foreground transition-colors duration-300"
              >
                Verify OTP
              </Button>
            )}
            <div className="mt-4 flex justify-between items-center">
              <button
                disabled={resendDisabled}
                onClick={handleResendOtp}
                className={`text-sm font-medium ${
                  resendDisabled
                    ? "text-muted-foreground"
                    : "text-[rgb(var(--link))] hover:underline"
                }`}
              >
                {resendDisabled
                  ? `Resend OTP in ${timer}s`
                  : "Didn't receive OTP? Resend"}
              </button>
            </div>
          </>
        );
      case "SET_PASSWORD":
        return (
          <>
            <div>
              <label htmlFor="newPassword" className="text-primary-text">
                Create New Password
              </label>
              <Input
                type="password"
                id="newPassword"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a new password"
                aria-label="New Password"
                className="border border-input focus:ring-primary focus:border-primary rounded-md"
              />
            </div>
            {errorMessage && <p className="text-destructive">{errorMessage}</p>}
            {isLoading ? (
              <Loader />
            ) : (
              <Button
                onClick={handleSetPassword}
                disabled={isLoading}
                className="w-full bg-primary text-button-text hover:bg-primary-foreground transition-colors duration-300"
              >
                Set Password and Continue
              </Button>
            )}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="grow flex flex-col items-center justify-center">
      <section className="space-y-4 w-[20rem] md:w-[32rem]">
        <Card className="bg-card shadow-lg rounded-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-primary-text">
              {stage === "PHONE_INPUT" && "Sign In"}
              {stage === "PASSWORD_INPUT" && "Enter Password"}
              {stage === "OTP_VERIFICATION" && "Verify OTP"}
              {stage === "SET_PASSWORD" && "Set New Password"}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Please follow the steps to continue
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">{renderFormFields()}</CardContent>
          {stage != "SET_PASSWORD" && (
            <>
              <OrSeparator />
              <ProviderLoginButtons />
            </>
          )}
        </Card>
      </section>
    </div>
  );
};

export default LoginPage;
