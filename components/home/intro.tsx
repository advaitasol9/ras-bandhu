import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

const Intro = () => {
  return (
    <div className="flex flex-col items-center mb-20 mt-2 md:mt-0">
      <section className="space-y-8 w-full px-4 md:px-8 lg:px-12">
        {/* Badges Section */}
        <div className="flex flex-col items-center space-y-2">
          <Badge variant="success" className="mb-1 text-sm">
            Your Trusted Guide to RAS Success
          </Badge>
          <Badge
            className="space-x-4 font-normal text-xs text-[rgb(var(--primary-text))]"
            variant="outline"
          >
            <p>
              <span className="font-bold">R</span>eview
            </p>
            <p>
              <span className="font-bold">A</span>nalyze
            </p>
            <p>
              <span className="font-bold">S</span>ucceed
            </p>
          </Badge>
        </div>

        {/* Main Content Section */}
        <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-6 bg-[rgb(var(--card))] rounded-xl shadow-lg px-2 py-4 md:p-6 lg:py-8 lg:px-6">
          {/* Left Image */}
          <div className="w-full lg:w-1/2 flex justify-center lg:justify-start">
            <Image
              src={"/home.svg"}
              alt="RAS Preparation Illustration"
              width={600}
              height={300}
              className="object-contain max-w-full h-auto"
            />
          </div>

          {/* Right Content */}
          <div className="flex flex-col items-center lg:items-start space-y-4 lg:space-y-5 text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-[rgb(var(--primary-text))]">
              Preparing for RAS Mains?
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-[rgb(var(--secondary-text))] max-w-2xl leading-relaxed">
              Get expert insights on your answers, evaluated by experienced
              faculty who have been through the interview process.
            </p>
            <div className="flex justify-center lg:justify-start">
              <Link href="/login">
                <Button
                  size="xl"
                  className="bg-[rgb(var(--primary))] text-[rgb(var(--button-text))] hover:bg-[rgb(var(--primary-foreground))]"
                >
                  Get Started Today
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Intro;
