"use client";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { FC, useState } from "react";
import { useAuth } from "reactfire";
import { FcGoogle } from "react-icons/fc";
import Loader from "@/components/ui/loader"; // Assuming you have a Loader component

interface Props {
  onSignIn?: () => void;
}

export const ProviderLoginButtons: FC<Props> = ({ onSignIn }) => {
  const auth = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const doProviderSignIn = async (provider: GoogleAuthProvider) => {
    try {
      setIsLoading(true);
      await signInWithPopup(auth, provider);
      toast({ title: "Signed in!" });
      onSignIn?.();
    } catch (err: any) {
      console.error(err);
      toast({ title: "Error signing in", description: `${err}` });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center mt-4 mb-6">
      <Button
        disabled={isLoading}
        onClick={async () => {
          const provider = new GoogleAuthProvider();
          await doProviderSignIn(provider);
        }}
        className="flex items-center bg--[rgb(var(--card))] border border-[rgb(var(--primary))] text-[rgb(var(--primary))] hover:border-[rgb(var(--primary-foreground))] hover:text-[rgb(var(--primary-foreground))] transition-colors duration-300"
      >
        {isLoading ? (
          <Loader /> // Show the Loader component when loading
        ) : (
          <>
            <FcGoogle size={24} className="mr-2" />
            Google
          </>
        )}
      </Button>
    </div>
  );
};
