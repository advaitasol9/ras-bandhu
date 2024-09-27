"use client";

import React, { useEffect, useState } from "react";
import { useFirestore } from "reactfire";
import {
  collection,
  query,
  where,
  getDocs,
  startAfter,
  limit,
} from "firebase/firestore";
import { useSearchParams } from "next/navigation";
import moment from "moment";
import { DailyEvaluationSubscription } from "@/lib/types"; // Define the subscription type if you haven't
import { Button } from "@/components/ui/button";
import Loader from "@/components/ui/loader";

const PlanList = () => {
  const firestore = useFirestore();
  const searchParams = useSearchParams();
  const planId = searchParams ? searchParams.get("planId") : "";

  const [subscriptions, setSubscriptions] = useState<
    DailyEvaluationSubscription[]
  >([]);
  const [activeOnly, setActiveOnly] = useState<boolean>(true);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isLastPage, setIsLastPage] = useState<boolean>(false);

  const pageSize = 5; // Number of items per page

  const fetchSubscriptions = async (loadMore = false) => {
    if (!planId) return;

    setLoading(true);

    // Reference to subscriptions collection
    const subscriptionsRef = collection(firestore, "DailyEvalSubscriptions");

    let subscriptionsQuery = query(
      subscriptionsRef,
      where("subscriptionPlan", "==", planId),
      limit(pageSize)
    );

    // If "Show current active" is selected, filter by subscriptionExpiry
    if (activeOnly) {
      const currentTime = moment().toISOString();
      subscriptionsQuery = query(
        subscriptionsQuery,
        where("subscriptionExpiry", ">", currentTime),
        limit(pageSize)
      );
    }

    // If loading more data, start after the last visible document
    if (loadMore && lastVisible) {
      subscriptionsQuery = query(subscriptionsQuery, startAfter(lastVisible));
    }

    const querySnapshot = await getDocs(subscriptionsQuery);
    const newSubscriptions = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as DailyEvaluationSubscription[];

    // Append new data to the existing data if loading more, otherwise replace
    setSubscriptions(
      loadMore ? [...subscriptions, ...newSubscriptions] : newSubscriptions
    );

    // Set last visible document for pagination if we fetched a full page of data
    if (querySnapshot.docs.length === pageSize) {
      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
    } else {
      setIsLastPage(true); // Mark if it is the last page
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [firestore, planId]);

  useEffect(() => {
    setSubscriptions([]);
    setLastVisible(null);
    setIsLastPage(false);
    fetchSubscriptions();
  }, [activeOnly]);

  const handleToggle = () => {
    setActiveOnly((prev) => !prev);
    setLastVisible(null); // Reset pagination
    setIsLastPage(false); // Allow loading more for the new filter
    fetchSubscriptions(false); // Refetch data with the new filter
  };

  const loadMore = () => {
    if (!isLastPage && !loading) {
      fetchSubscriptions(true); // Fetch the next page
    }
  };

  return (
    <div className="container mx-auto mt-8 p-6">
      <h1 className="text-2xl font-semibold mb-4 text-[rgb(var(--primary-text))]">
        Subscriptions for Plan: {planId}
      </h1>

      {/* Toggle between current active and all-time data */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-md font-medium text-[rgb(var(--primary-text))]">
          {activeOnly
            ? "Showing active subscriptions"
            : "Showing all subscriptions"}
        </p>
        <div className="flex items-center space-x-2">
          <span className="text-[rgb(var(--primary-text))]">
            {activeOnly ? "Active" : "All-time"}
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={activeOnly}
              onChange={handleToggle}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-[rgb(var(--muted))] rounded-full peer peer-checked:bg-[rgb(var(--primary))] peer-focus:ring-4 peer-focus:ring-[rgb(var(--primary-foreground))] transition-all duration-300"></div>
            <div className="absolute left-1 top-1 w-4 h-4 bg-[rgb(var(--background))] rounded-full transition-all peer-checked:translate-x-5"></div>
          </label>
        </div>
      </div>

      {/* Display the list of subscriptions */}
      <div className="space-y-4">
        {subscriptions.length > 0 ? (
          subscriptions.map((sub) => (
            <div
              key={sub.id}
              className="p-4 bg-[rgb(var(--card))] rounded-md shadow-md flex flex-col space-y-2"
            >
              <p className="text-md font-medium text-[rgb(var(--primary-text))]">
                User ID: {sub.userId}
              </p>
              <p className="text-sm text-[rgb(var(--secondary-text))]">
                Phone: {sub.userInfo?.phone || "N/A"}
              </p>
              <p className="text-sm text-[rgb(var(--secondary-text))]">
                Name: {sub.userInfo?.name || "N/A"}
              </p>
              <p className="text-sm text-[rgb(var(--secondary-text))]">
                Email: {sub.userInfo?.email || "N/A"}
              </p>
              <p className="text-sm text-[rgb(var(--secondary-text))]">
                Subscription Expiry:{" "}
                {moment(sub.subscriptionExpiry).format("DD/MM/YYYY")}
              </p>
            </div>
          ))
        ) : (
          <p className="text-md text-[rgb(var(--primary-text))]">
            No subscriptions found.
          </p>
        )}
      </div>

      {/* Load More Button */}
      {!isLastPage && !loading && (
        <div className="flex justify-center mt-8">
          <Button
            size="sm"
            onClick={loadMore}
            className="bg-[rgb(var(--muted))] text-[rgb(var(--primary-text))] ml-2"
          >
            Load More
          </Button>
        </div>
      )}

      {/* Loader */}
      {loading && (
        <div className="flex justify-center mt-8">
          <Loader />
        </div>
      )}
    </div>
  );
};

export default PlanList;
