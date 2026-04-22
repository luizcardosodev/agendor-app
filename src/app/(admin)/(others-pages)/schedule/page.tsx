import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { ScheduleGlobal } from "@/components/schedule/schedule-global";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Next.js Profile | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Profile page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default function Schedule() {
  return (
    <div className="h-full w-full ">
      {/* <PageBreadCrumb /> */}
      <ScheduleGlobal />
    </div>
  );
}
