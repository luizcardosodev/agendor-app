"use client";
import React from "react";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useBreadcrumbs } from "@/context/BreadcrumbContext";

interface BreadcrumbProps {
  pageTitle?: string;
}

const PageBreadcrumb: React.FC<BreadcrumbProps> = ({ pageTitle }) => {
  const { breadcrumbs, pageTitle: contextPageTitle } = useBreadcrumbs();

  const displayTitle = pageTitle || contextPageTitle;
  const currentCrumb = breadcrumbs[breadcrumbs.length - 1];

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-4 bg-white rounded-xl border border-[var(--surface-border)] px-12 py-4">
      <div className="flex items-center gap-2">
        {currentCrumb?.icon && (
          <span className="text-gray-500 dark:text-gray-400">
            {currentCrumb.icon}
          </span>
        )}
        <h2 className="text-xl font-semibold dark:text-white/90">
          {displayTitle}
        </h2>
      </div>

      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.path}>
              <BreadcrumbItem>
                {index === breadcrumbs.length - 1 ? (
                  <BreadcrumbPage>{crumb.name}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={crumb.path}>{crumb.name}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};

export default PageBreadcrumb;
