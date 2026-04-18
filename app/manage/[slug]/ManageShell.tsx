"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import WizardShell from "@/components/WizardShell";
import StepSchoolInfo from "@/components/wizard/StepSchoolInfo";
import StepColors from "@/components/wizard/StepColors";
import StepSchedule from "@/components/wizard/StepSchedule";
import StepLunchWaves from "@/components/wizard/StepLunchWaves";
import StepCalendar from "@/components/wizard/StepCalendar";
import StepFeatures from "@/components/wizard/StepFeatures";
import StepReview from "@/components/wizard/StepReview";
import AnnouncementsPanel from "@/components/admin/AnnouncementsPanel";
import type { WizardFormData } from "@/lib/types";

type Tab = "announcements" | "setup";

const STEPS = [
  StepSchoolInfo,
  StepColors,
  StepSchedule,
  StepLunchWaves,
  StepCalendar,
  StepFeatures,
  StepReview,
];

type Props = {
  schoolId: string;
  schoolName: string;
  schoolSlug: string;
  initialData: WizardFormData;
};

export default function ManageShell({ schoolId, schoolName, initialData }: Props) {
  const searchParams = useSearchParams();
  const initialTab: Tab = searchParams.get("tab") === "setup" ? "setup" : "announcements";
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  async function handleLogout() {
    await fetch("/api/auth/session", { method: "DELETE" });
    window.location.href = "/login";
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Manage
            </p>
            <h1 className="mt-0.5 text-2xl font-semibold text-white">{schoolName}</h1>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-white/20 px-3 py-2 text-sm text-gray-300 transition-colors hover:text-white"
          >
            Log out
          </button>
        </div>

        <div className="mb-6 flex gap-1 rounded-lg border border-white/10 bg-white/5 p-1">
          <button
            onClick={() => setActiveTab("announcements")}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "announcements"
                ? "bg-white text-black"
                : "text-gray-300 hover:text-white"
            }`}
          >
            Announcements
          </button>
          <button
            onClick={() => setActiveTab("setup")}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "setup" ? "bg-white text-black" : "text-gray-300 hover:text-white"
            }`}
          >
            Edit Setup
          </button>
        </div>

        {activeTab === "announcements" ? (
          <AnnouncementsPanel schoolId={schoolId} />
        ) : (
          <WizardShell steps={STEPS} initialData={initialData} schoolId={schoolId} />
        )}
      </div>
    </div>
  );
}
