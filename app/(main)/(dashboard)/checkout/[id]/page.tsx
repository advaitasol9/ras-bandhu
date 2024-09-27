"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useFirestore, useFunctions } from "reactfire"; // Firebase utilities from reactfire
import { doc, getDoc } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { Button } from "@/components/ui/button";
import { Plan } from "@/lib/types";
import CheckoutRoute from "../checkout-route";
import { useUserContext } from "@/components/context/user-provider";
import Loader from "@/components/ui/loader";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const parentTypes: { [key: string]: string } = {
  dailyEvaluation: "Daily Evaluation",
  testEvaluation: "Test Evaluation",
  testSeries: "Test Series",
};

const CheckoutPage = () => {
  const params = useParams();
  const router = useRouter();
  const firestore = useFirestore();
  const functions = useFunctions(); // Functions from Firebase
  const { user, userData } = useUserContext(); // Fetching logged-in user details

  const [planData, setPlanData] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // Loader state for payment processing
  const [paymentError, setPaymentError] = useState<string | null>(null); // Payment error state

  const planId = params?.id as string;

  useEffect(() => {
    const fetchPlanData = async () => {
      if (!planId) return;

      const planDocRef = doc(firestore, "SubscriptionPlans", planId);
      const planSnapshot = await getDoc(planDocRef);
      if (planSnapshot.exists()) {
        const plan = planSnapshot.data() as Plan;
        setPlanData(plan);
      }
      setLoading(false);
    };

    fetchPlanData();
  }, [planId, firestore]);

  useEffect(() => {
    // Load Razorpay SDK
    const loadRazorpayScript = () => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => setIsRazorpayLoaded(true);
      script.onerror = () => console.error("Razorpay SDK failed to load.");
      document.body.appendChild(script);
    };

    loadRazorpayScript();
  }, []);

  const handlePayment = async () => {
    if (!user || !planData) return;

    try {
      setIsProcessing(true);
      setPaymentError(null);

      // Call Firebase function to create the order
      const createOrder = httpsCallable(functions, "createRazorpayOrder");
      const result: any = await createOrder({ planId, currency: "INR" });
      const { orderId, amount, currency } = result.data;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID as string, // Razorpay Key ID
        amount,
        currency,
        name: "RAS Bandhu",
        description: `Purchase of ${planData.name}`,
        order_id: orderId,
        handler: async (response: any) => {
          // On successful payment, verify payment on backend
          try {
            const verifyPayment = httpsCallable(
              functions,
              "verifyRazorpayPayment"
            );
            const verificationResult: any = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verificationResult.data.success) {
              alert("Subscribed successfully");
              router.push("/app");
            } else {
              throw new Error("Payment verification failed.");
            }
          } catch (error) {
            setPaymentError("Payment verification failed. Please try again.");
            console.error("Payment verification error:", error);
            setIsProcessing(false);
          }
        },
        prefill: {
          name: userData?.name || user.email || "",
          email: user.email || "",
          contact: userData?.phoneNumber || "",
        },
        theme: {
          color: "rgb(var(--primary))", // Dynamic color based on the theme
        },
      };

      // Check if Razorpay SDK is loaded
      if (isRazorpayLoaded) {
        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } else {
        throw new Error("Razorpay SDK not loaded.");
      }
    } catch (error) {
      setPaymentError("Error creating Razorpay order. Please try again.");
      console.error("Error creating Razorpay order:", error);
      setIsProcessing(false);
    }
  };

  if (loading)
    return (
      <div className="text-center mt-12">
        <Loader />
      </div>
    );

  if (!planData)
    return (
      <div className="text-center mt-12">
        <p className="text-destructive">No plan data found</p>
      </div>
    );

  const parentSectionName =
    parentTypes[planData.parentSection] || "Unknown Plan Type";

  return (
    <CheckoutRoute>
      <div className="container mx-auto mt-8 max-w-4xl bg-[rgb(var(--card))] p-8 py-16 rounded-lg shadow-lg">
        <h1 className="text-2xl font-semibold text-[rgb(var(--primary-text))] text-center mb-16">
          Checkout
        </h1>

        <div className="flex flex-col lg:flex-row justify-between gap-8">
          {/* Left Section: Plan Info */}
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-[rgb(var(--primary-text))] mb-4">
              {parentSectionName} - {planData.name}
            </h2>
            <div className="mb-6">
              {planData.features.map((feature, index) => (
                <p
                  key={index}
                  className="text-sm text-[rgb(var(--muted-foreground))] mb-2"
                >
                  {feature}
                </p>
              ))}
            </div>
          </div>

          {/* Right Section: Price and Payment */}
          <div className="flex-1 lg:max-w-xs border rounded-lg p-6 bg-[rgb(var(--secondary-card))]">
            <div className="mb-6 space-y-2">
              {planData.discountedPrice !== planData.price ? (
                <>
                  <p className="text-sm line-through text-[rgb(var(--destructive))]">
                    Original Price: ₹ {planData.price}
                  </p>
                  <p className="text-sm font-semibold text-[rgb(var(--primary-text))]">
                    Discounted Price: ₹ {planData.discountedPrice}
                  </p>
                  <p className="text-sm font-semibold text-[rgb(var(--primary-text))]">
                    (Inclusive of GST)
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold text-[rgb(var(--primary-text))]">
                    Price: ₹ {planData.price}
                  </p>
                  <p className="text-sm font-semibold text-[rgb(var(--primary-text))]">
                    (Inclusive of GST)
                  </p>
                </>
              )}
            </div>

            {/* Loader or Pay Button */}
            {isProcessing ? (
              <Loader />
            ) : (
              <Button
                onClick={handlePayment}
                className="w-full bg-[rgb(var(--primary))] text-[rgb(var(--button-text))] hover:bg-[rgb(var(--primary-foreground))]"
                disabled={isProcessing} // Disable button while processing
              >
                {`PAY (₹${planData.discountedPrice || planData.price})`}
              </Button>
            )}

            {/* Display payment errors */}
            {!!paymentError && (
              <div className="text-red-600 text-sm mt-4 text-center">
                {paymentError}
              </div>
            )}
          </div>
        </div>
      </div>
    </CheckoutRoute>
  );
};

export default CheckoutPage;
