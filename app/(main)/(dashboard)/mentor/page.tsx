"use client";

import React, { useState, useEffect } from "react";
import MentorRoute from "./mentor-route";
import { useUserContext } from "@/components/context/user-provider";
import { useFirestore } from "reactfire";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from "firebase/firestore";
import moment from "moment";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import HistoryCard from "@/components/demo-dashboard/history-card";
import Link from "next/link";

type Evaluation = {
  id: string;
  userId: string;
  subject: string;
  createdAt: string;
  type: string;
  numberOfAnswers: number;
  status: "Pending" | "Assigned" | "Evaluated";
  files: { url: string; type: string }[];
  mentorAssigned?: string;
  mentorComments?: string;
  mentorEvaluationUrl?: string;
  review?: {
    rating: number;
    feedback: string;
    feedbackImages: string[];
  };
  assignedAt?: string;
  evaluatedAt?: string;
};

const MentorDashboard = () => {
  const { user } = useUserContext();
  const firestore = useFirestore();
  const docLimit = 3;

  const [assignedEvaluations, setAssignedEvaluations] = useState<Evaluation[]>(
    []
  );
  const [totalEvaluatedThisMonth, setTotalEvaluatedThisMonth] =
    useState<number>(0);
  const [lastEvaluatedAnswers, setLastEvaluatedAnswers] = useState<
    Evaluation[]
  >([]);

  useEffect(() => {
    const fetchMentorData = async () => {
      if (!user) return;

      const mentorId = user.uid;

      // 1. Fetch Assigned Evaluations
      const assignedQuery = query(
        collection(firestore, "DailyEvalRequests"),
        where("mentorAssigned", "==", mentorId),
        where("status", "==", "Assigned"),
        limit(docLimit)
      );
      const assignedSnapshot = await getDocs(assignedQuery);
      setAssignedEvaluations(
        assignedSnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Evaluation)
        )
      );

      // 2. Fetch Last Evaluated Answers with Feedback
      const lastEvaluatedQuery = query(
        collection(firestore, "DailyEvalRequests"),
        where("mentorAssigned", "==", mentorId),
        where("status", "==", "Evaluated"),
        orderBy("evaluatedAt", "desc"),
        limit(docLimit)
      );
      const lastEvaluatedSnapshot = await getDocs(lastEvaluatedQuery);
      setLastEvaluatedAnswers(
        lastEvaluatedSnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Evaluation)
        )
      );

      // 3. Fetch Total Evaluated This Month
      const evaluatedQuery = query(
        collection(firestore, "DailyEvalRequests"),
        where("mentorAssigned", "==", mentorId),
        where("status", "==", "Evaluated"),
        where("evaluatedAt", ">=", moment().startOf("month").toISOString())
      );
      const evaluatedSnapshot = await getDocs(evaluatedQuery);
      var totalEvaluated = 0;
      evaluatedSnapshot.forEach((snap) => {
        const data = snap.data() as Evaluation;
        totalEvaluated += data.numberOfAnswers;
      });
      setTotalEvaluatedThisMonth(totalEvaluated);
    };

    fetchMentorData();
  }, [user, firestore]);

  return (
    <MentorRoute>
      <div className="w-full px-4 md:px-8 lg:px-12 mt-8">
        <h1 className="text-2xl font-semibold mb-8 text-[rgb(var(--primary-text))]">
          Mentor Dashboard
        </h1>
        <div className="flex flex-col justify-center bg-[rgb(var(--muted))] px-6 rounded-xl h-16">
          <div className="text-sm text-[rgb(var(--primary-text))]">
            Total Evaluated This Month: {totalEvaluatedThisMonth}
          </div>
          <Link
            href="/mentor/daily-evaluations?status=Pending"
            className="flex items-center font-medium text-[rgb(var(--primary-text))]"
          >
            View Pending{" "}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3 ml-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mt-4">
          <Card className="bg-[rgb(var(--background))] text-[rgb(var(--primary-text))]">
            <CardHeader>
              <CardTitle>Current Assigned</CardTitle>
              <CardDescription className="cursor-pointer">
                <Link
                  href="/mentor/daily-evaluations?status=Assigned"
                  className="flex items-center text-[rgb(var(--primary-text))]"
                >
                  View All{" "}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 ml-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </CardDescription>
            </CardHeader>
            <CardContent className="px-2 md:px-4 lg:px-6">
              {assignedEvaluations.length > 0 ? (
                <ul>
                  {assignedEvaluations.map((item, index) => (
                    <div key={index} className="mb-4">
                      <HistoryCard
                        key={index}
                        item={item}
                        index={index}
                        linkTo={`/mentor/daily-evaluations/${item.id}`}
                      />
                    </div>
                  ))}
                </ul>
              ) : (
                <p className="text-[rgb(var(--primary-text))] text-center md:text-start">
                  No current assigned evaluations
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-[rgb(var(--background))] text-[rgb(var(--primary-text))]">
            <CardHeader>
              <CardTitle>Last Evaluated</CardTitle>
              <CardDescription className="cursor-pointer">
                <Link
                  href="/mentor/daily-evaluations?status=Evaluated"
                  className="flex items-center text-[rgb(var(--primary-text))]"
                >
                  View All{" "}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 ml-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </CardDescription>
            </CardHeader>
            <CardContent className="px-2 md:px-4 lg:px-6">
              {lastEvaluatedAnswers.length > 0 ? (
                <ul>
                  {lastEvaluatedAnswers.map((item, index) => (
                    <div key={index} className="mb-4">
                      <HistoryCard
                        key={index}
                        item={item}
                        index={index}
                        linkTo={`/mentor/daily-evaluations/${item.id}`}
                      />
                    </div>
                  ))}
                </ul>
              ) : (
                <p className="text-[rgb(var(--primary-text))] text-center md:text-start">
                  No recent evaluated answers
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MentorRoute>
  );
};

export default MentorDashboard;
