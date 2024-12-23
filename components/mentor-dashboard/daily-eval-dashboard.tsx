"use client";

import React, { useState, useEffect } from "react";
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
import HistoryCard from "@/components/user-dashboard/history-card";
import Link from "next/link";
import { FaArrowRight, FaSearch } from "react-icons/fa";
import { Evaluation } from "@/lib/types";

const DailyEvalMentorDashboard = () => {
  const { user } = useUserContext();
  const firestore = useFirestore();
  const docLimit = 3;

  const [assignedEvaluations, setAssignedEvaluations] = useState<Evaluation[]>(
    []
  );
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
    };

    fetchMentorData();
  }, [user, firestore]);

  return (
    <div className="w-full">
      <div className="flex flex-col justify-center bg-muted px-6 rounded-xl h-16">
        <div className="flex justify-between items-center">
          <Link
            href="/mentor/daily-evaluations?status=Pending"
            className="flex items-center font-medium text-primary-text"
          >
            View Pending{" "}
            <FaArrowRight className="w-3 h-3 hover:opacity-80 transition ml-1 text-muted-foreground" />
          </Link>
          <Link
            href="/search-student"
            className="flex items-center font-normal md:font-medium text-sm md:text-base text-primary hover:text-primary-foreground transition"
          >
            Search Student
            <FaSearch className="w-4 h-4 ml-2 text-primary" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mt-4">
        <Card className="bg-background text-primary-text">
          <CardHeader>
            <CardTitle>Current Assigned</CardTitle>
            <CardDescription className="cursor-pointer">
              <Link
                href="/mentor/daily-evaluations?status=Assigned"
                className="flex items-center text-primary-text"
              >
                View All{" "}
                <FaArrowRight className="w-3 h-3 hover:opacity-80 transition ml-1 text-muted-foreground" />
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
              <p className="text-primary-text text-center md:text-start">
                No current assigned evaluations
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-background text-primary-text">
          <CardHeader>
            <CardTitle>Last Evaluated</CardTitle>
            <CardDescription className="cursor-pointer">
              <Link
                href="/mentor/daily-evaluations?status=Evaluated"
                className="flex items-center text-primary-text"
              >
                View All{" "}
                <FaArrowRight className="w-3 h-3 hover:opacity-80 transition ml-1 text-muted-foreground" />
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
              <p className="text-primary-text text-center md:text-start">
                No recent evaluated answers
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DailyEvalMentorDashboard;
