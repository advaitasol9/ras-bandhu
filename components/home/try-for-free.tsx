import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const TryForFree = () => {
  return (
    <section className="w-full bg-gradient-to-r from-[rgb(var(--background))]/20 to-[rgb(var(--background))] py-16 flex flex-col items-center justify-center text-[rgb(var(--primary-text))] text-center mt-6 mb-12">
      <h2 className="text-3xl font-semibold mb-4">TRY FOR FREE</h2>
      <p className="text-lg mb-6">
        Get 2 Answers Evaluated For Free and then decide
      </p>
      <Link href="/login" className="mt-3">
        <Button
          size="lg"
          className="bg-[rgb(var(--primary))] text-[rgb(var(--button-text))] hover:bg-[rgb(var(--primary-foreground))]"
        >
          Start For Free
        </Button>
      </Link>
    </section>
  );
};

export default TryForFree;
