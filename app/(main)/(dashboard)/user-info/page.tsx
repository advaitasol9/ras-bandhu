"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useFirestore } from "reactfire";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  limit,
  startAfter,
  orderBy,
} from "firebase/firestore";
import HistoryCard from "@/components/demo-dashboard/history-card";
import { Button } from "@/components/ui/button";
import Loader from "@/components/ui/loader";
import { DailyEvaluationSubscription, Evaluation, User } from "@/lib/types";
import { useUserContext } from "@/components/context/user-provider";

const UserProfile = () => {
  const firestore = useFirestore();
  const searchParams = useSearchParams();
  const { isAdmin } = useUserContext();
  const pathname = usePathname();
  const userId = searchParams ? searchParams.get("userId") : null;

  const [userDetails, setUserDetails] = useState<User | null>(null);
  const [subscriptionDetails, setSubscriptionDetails] =
    useState<DailyEvaluationSubscription | null>(null);
  const [evalRequests, setEvalRequests] = useState<Evaluation[]>([]);
  const [lastVisible, setLastVisible] = useState<any>(null); // For pagination
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false); // Separate loader for fetch more

  const initialLimit = 15; // Initial number of records to fetch

  // Fetch user details from 'Users' collection
  const fetchUserDetails = async () => {
    try {
      const userDocRef = doc(firestore, "Users", userId || "");
      const userSnapshot = await getDoc(userDocRef);
      if (userSnapshot.exists()) {
        setUserDetails(userSnapshot.data() as User);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  // Fetch subscription details from 'DailyEvalSubscriptions' collection
  const fetchSubscriptionDetails = async () => {
    try {
      const subscriptionDocRef = doc(
        firestore,
        "DailyEvalSubscriptions",
        userId || ""
      );
      const subscriptionSnapshot = await getDoc(subscriptionDocRef);
      if (subscriptionSnapshot.exists()) {
        setSubscriptionDetails(
          subscriptionSnapshot.data() as DailyEvaluationSubscription
        );
      }
    } catch (error) {
      console.error("Error fetching subscription details:", error);
    }
  };

  // Fetch initial set of evaluation requests from 'DailyEvalRequests' collection
  const fetchEvalRequests = async (loadMore = false) => {
    try {
      if (!userId) return;

      if (!loadMore) setLoading(true);
      else setLoadingMore(true);

      const evalRequestsRef = collection(firestore, "DailyEvalRequests");
      let evalRequestsQuery = query(
        evalRequestsRef,
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
        limit(initialLimit)
      );

      if (loadMore && lastVisible) {
        evalRequestsQuery = query(
          evalRequestsRef,
          where("userId", "==", userId),
          orderBy("createdAt", "desc"),
          startAfter(lastVisible),
          limit(initialLimit)
        );
      }

      const evalRequestsSnapshot = await getDocs(evalRequestsQuery);

      const requestsData = evalRequestsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Evaluation[];

      setEvalRequests((prev) =>
        loadMore ? [...prev, ...requestsData] : requestsData
      );

      // Set the last visible document for pagination
      const lastVisibleDoc =
        evalRequestsSnapshot.docs[evalRequestsSnapshot.docs.length - 1];
      setLastVisible(lastVisibleDoc || null);

      setLoading(false);
      setLoadingMore(false);
    } catch (error) {
      console.error("Error fetching evaluation requests:", error);
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUserDetails();
      fetchSubscriptionDetails();
      fetchEvalRequests();
    }
  }, [userId]);

  if (loading || !userDetails || !subscriptionDetails) {
    return <Loader />;
  }

  return (
    <div className="container mx-auto mt-8 p-6">
      {/* User Details */}
      <div className="mb-8">
        <h2 className="text-xl font-medium text-[rgb(var(--primary-text))]">
          User Details
        </h2>
        <p className="text-md text-[rgb(var(--secondary-text))]">
          Name: {userDetails.name}
        </p>
        <p className="text-md text-[rgb(var(--secondary-text))]">
          Email: {userDetails.email}
        </p>
        <p className="text-md text-[rgb(var(--secondary-text))]">
          Phone: {userDetails.phone}
        </p>
      </div>

      {/* Subscription Details */}
      <div className="mb-8">
        <h2 className="text-xl font-medium text-[rgb(var(--primary-text))]">
          Subscription Details
        </h2>
        <p className="text-md text-[rgb(var(--secondary-text))]">
          Plan Name: {subscriptionDetails.subInfo.name}
        </p>
        <p className="text-md text-[rgb(var(--secondary-text))]">
          Medium: {subscriptionDetails.subInfo.medium}
        </p>
        <p className="text-md text-[rgb(var(--secondary-text))]">
          Subscription Expiry:{" "}
          {new Date(
            subscriptionDetails.subscriptionExpiry
          ).toLocaleDateString()}
        </p>
      </div>

      {/* Evaluation Requests */}
      <div className="mb-8">
        <h2 className="text-xl font-medium text-[rgb(var(--primary-text))] mb-4">
          Evaluation Requests
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {evalRequests.length > 0 ? (
            evalRequests.map((item, index) => (
              <HistoryCard
                item={item}
                index={index}
                linkTo={
                  isAdmin
                    ? `${pathname}?userId=${userId}`
                    : `/mentor/daily-evaluations/${item.id}`
                }
                key={`card${index}`}
              />
            ))
          ) : (
            <p className="text-md text-[rgb(var(--secondary-text))]">
              No evaluation requests found.
            </p>
          )}
        </div>
      </div>

      {/* Fetch More Button */}
      {evalRequests.length > 0 && lastVisible && (
        <div className="flex justify-center mt-8">
          <Button
            onClick={() => fetchEvalRequests(true)}
            disabled={loadingMore}
            className="bg-[rgb(var(--primary))] text-[rgb(var(--button-text))] hover:bg-[rgb(var(--primary-foreground))] transition-colors duration-300"
          >
            {loadingMore ? "Loading..." : "Fetch More"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
