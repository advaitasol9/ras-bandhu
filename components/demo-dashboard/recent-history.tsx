"use client";
import React, { useEffect, useState } from "react";
import { useFirestore, useUser } from "reactfire";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import Link from "next/link";
import HistoryCard from "./history-card";
import { Evaluation } from "@/lib/types";
import { FaArrowRight } from "react-icons/fa";

export function RecentHistory() {
  const [submissions, setSubmissions] = useState<Evaluation[]>([]);
  const firestore = useFirestore();
  const { data: user } = useUser();

  useEffect(() => {
    const fetchRecentSubmissions = async () => {
      if (!user) return;

      const q = query(
        collection(firestore, "DailyEvalRequests"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc"),
        limit(2)
      );

      const querySnapshot = await getDocs(q);
      const recentSubmissions: Evaluation[] = querySnapshot.docs.map(
        (doc: QueryDocumentSnapshot) => ({
          id: doc.id,
          ...doc.data(),
        })
      ) as Evaluation[];

      setSubmissions(recentSubmissions);
    };

    fetchRecentSubmissions();
  }, [firestore, user]);

  return (
    <Card className="col-span-4 bg-[rgb(var(--background))] text-[rgb(var(--primary-text))]">
      <CardHeader>
        <CardTitle className="text-center lg:text-start">
          Recent History
        </CardTitle>
        {!submissions.length && (
          <CardDescription className="cursor-pointer">
            <Link
              href="/app/daily-evaluations"
              className="flex items-center justify-center lg:justify-start"
            >
              View All{" "}
              <FaArrowRight className="w-3 h-3 hover:opacity-80 transition ml-1" />
            </Link>
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="px-2 md:px-4 lg:px-6">
        <div className="space-y-8">
          {submissions.length ? (
            submissions.map((item, index) => (
              <HistoryCard
                key={index}
                item={item}
                index={index}
                linkTo={`/app/daily-evaluations/${item.id}`}
              />
            ))
          ) : (
            <h1 className="text-[rgb(var(--primary-text))] text-center lg:text-start">
              No Previous History
            </h1>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
