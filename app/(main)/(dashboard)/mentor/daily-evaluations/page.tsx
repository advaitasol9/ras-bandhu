"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useFirestore, useUser } from "reactfire";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  QueryDocumentSnapshot,
  Timestamp,
} from "firebase/firestore";
import { useUserContext } from "@/components/context/user-provider";
import HistoryCard from "@/components/user-dashboard/history-card";
import MentorRoute from "../mentor-route";
import { useSearchParams } from "next/navigation";
import { Evaluation } from "@/lib/types";
import DatePicker from "react-datepicker"; // Assuming you're using react-datepicker for date selection
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";

const MyEvaluations: React.FC = () => {
  const searchParams = useSearchParams();
  const status = searchParams ? searchParams.get("status") : "";

  const [submissions, setSubmissions] = useState<Evaluation[]>([]);
  const [selectedMedium, setSelectedMedium] = useState<string>("");
  const [containsPyQ, setContainsPyQ] = useState<string>("");
  const [selectedPaper, setSelectedPaper] = useState<string>("");
  const [filterSubject, setFilterSubject] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>(status || "Pending");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot | null>(
    null
  );
  const [isLastPage, setIsLastPage] = useState<boolean>(false);

  const firestore = useFirestore();
  const { data: user } = useUser();
  const { appData } = useUserContext();
  const papers = Object.keys(appData?.subjectsByPaper || {}).sort();
  const subjects = selectedPaper
    ? appData?.subjectsByPaper?.[selectedPaper]
    : [];

  const pageSize = 12; // Number of items per page

  const fetchSubmissions = async (loadMore = false) => {
    if (!user) return;
    let q = query(
      collection(firestore, "DailyEvalRequests"),
      orderBy("createdAt", "desc"),
      limit(pageSize)
    );

    if (containsPyQ) {
      q = query(q, where("containsPyq", "==", containsPyQ));
    }

    if (selectedMedium) {
      q = query(q, where("medium", "==", selectedMedium));
    }

    if (selectedPaper) {
      q = query(q, where("paper", "==", selectedPaper));
    }

    if (selectedPaper && filterSubject) {
      q = query(q, where("subject", "==", filterSubject));
    }

    if (filterStatus) {
      q = query(q, where("status", "==", filterStatus));
    }

    if (filterStatus === "Evaluated" || filterStatus === "Assigned") {
      q = query(q, where("mentorAssigned", "==", user.uid));
    }

    if (startDate && endDate) {
      q = query(
        q,
        where(
          "createdAt",
          ">=",
          moment(startDate).startOf("day").toISOString()
        ),
        where("createdAt", "<=", moment(endDate).endOf("day").toISOString())
      );
    }

    if (loadMore && lastVisible) {
      q = query(q, startAfter(lastVisible));
    }

    const querySnapshot = await getDocs(q);
    const newSubmissions: Evaluation[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Evaluation[];

    setSubmissions(
      loadMore ? [...submissions, ...newSubmissions] : newSubmissions
    );

    if (querySnapshot.docs.length > 0) {
      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
    }
    if (querySnapshot.docs.length < pageSize) setIsLastPage(true);
  };

  useEffect(() => {
    if (!selectedPaper && filterSubject) setFilterSubject("");
    setCurrentPage(1);
    setLastVisible(null);
    setIsLastPage(false);
    fetchSubmissions();
  }, [
    containsPyQ,
    selectedMedium,
    selectedPaper,
    filterSubject,
    filterStatus,
    startDate,
    endDate,
    user,
  ]);

  const handleClearFilters = () => {
    setContainsPyQ("");
    setSelectedMedium("");
    setSelectedPaper("");
    setFilterSubject("");
    setFilterStatus("Pending");
    setStartDate(undefined);
    setEndDate(undefined);
    setCurrentPage(1);
    setLastVisible(null);
    setIsLastPage(false);
    fetchSubmissions();
  };

  const loadMoreSubmissions = () => {
    setCurrentPage(currentPage + 1);
    fetchSubmissions(true);
  };

  return (
    <MentorRoute>
      <div className="px-4 py-4 md:px-12 md:py-8">
        <h1 className="text-2xl font-semibold mb-8 text-primary-text">
          My Evaluations
        </h1>

        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 mb-6">
          <div className="w-full md:w-auto">
            <select
              id="pyqFilter"
              value={containsPyQ}
              onChange={(e) => setContainsPyQ(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            >
              <option value="">DQB</option>
              {["yes", "no"].map((val: string, ind: number) => (
                <option value={val} key={`pyq${ind}`}>
                  {val}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full md:w-auto">
            <select
              id="mediumFilter"
              value={selectedMedium}
              onChange={(e) => setSelectedMedium(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            >
              <option value="">All Medium</option>
              {["english", "hindi"].map((med: string, ind: number) => (
                <option value={med} key={`med${ind}`}>
                  {med}
                </option>
              ))}
            </select>
          </div>

          {/* Paper Filter */}
          <div className="w-full md:w-auto">
            <select
              id="paperFilter"
              value={selectedPaper}
              onChange={(e) => setSelectedPaper(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            >
              <option value="">All Paper</option>
              {papers.map((paper: string, ind: number) => (
                <option value={paper} key={`paper${ind}`}>
                  {paper}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Filter */}
          {!!selectedPaper && (
            <div className="w-full md:w-auto">
              <select
                id="subjectFilter"
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              >
                <option value="">Subject</option>
                {subjects.map((subject: any, ind: number) => (
                  <option value={subject.code} key={`sub${ind}`}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Status Filter */}
          <div className="w-full md:w-auto">
            <select
              id="statusFilter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            >
              <option value="Evaluated">Evaluated</option>
              <option value="Assigned">Assigned</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Date Pickers */}
          <div className="flex flex-wrap gap-4 items-center">
            <DatePicker
              selected={startDate}
              onChange={(date: Date | null) => setStartDate(date || undefined)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              placeholderText="Start Date"
              className="px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            />
            <DatePicker
              selected={endDate}
              onChange={(date: Date | null) => setEndDate(date || undefined)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              placeholderText="End Date"
              className="px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            />
          </div>

          {/* Clear Filters Button */}
          <Button
            size="sm"
            onClick={handleClearFilters}
            className="bg-muted text-primary-text w-full md:w-auto"
          >
            Clear
          </Button>
        </div>

        {/* Answers Grid */}
        {submissions.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {submissions.map((item, index) => (
              <HistoryCard
                key={index}
                item={item}
                index={index}
                linkTo={`/mentor/daily-evaluations/${item.id}`}
              />
            ))}
          </div>
        ) : (
          <h1 className="text-primary-text">No Data Found</h1>
        )}

        {/* Load More Button */}
        {!isLastPage && (
          <div className="flex justify-center mt-8">
            <Button
              size="sm"
              onClick={loadMoreSubmissions}
              className="bg-muted text-primary-text ml-2"
            >
              Load More
            </Button>
          </div>
        )}
      </div>
    </MentorRoute>
  );
};

export default MyEvaluations;
