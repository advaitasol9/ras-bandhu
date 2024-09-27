"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import AdminRoute from "./admin-route";

const AdminHomepage: React.FC = () => {
  const router = useRouter();

  return (
    <AdminRoute>
      <div className="container mx-auto mt-12 flex flex-col items-center justify-center space-y-8 bg-[rgb(var(--card))] p-8 rounded-xl shadow-lg max-w-3xl">
        <h1 className="text-4xl font-bold text-center text-[rgb(var(--primary-text))]">
          Admin Dashboard
        </h1>

        <p className="text-lg text-[rgb(var(--secondary-text))] text-center mb-8">
          Manage your platform.
        </p>

        <Button
          onClick={() => router.push("/admin/subscriptions")}
          className="w-full max-w-sm bg-[rgb(var(--primary))] text-[rgb(var(--button-text))] hover:bg-[rgb(var(--primary-foreground))]"
        >
          View Subscription Plans
        </Button>

        <Button
          onClick={() => router.push("/admin/plan-stats")}
          className="w-full max-w-sm bg-[rgb(var(--primary))] text-[rgb(var(--button-text))] hover:bg-[rgb(var(--primary-foreground))]"
        >
          View Plan Stats
        </Button>

        <Button
          onClick={() => router.push("/admin/mentor-management")}
          className="w-full max-w-sm bg-[rgb(var(--primary))] text-[rgb(var(--button-text))] hover:bg-[rgb(var(--primary-foreground))]"
        >
          Manage Mentors
        </Button>
      </div>
    </AdminRoute>
  );
};

export default AdminHomepage;
