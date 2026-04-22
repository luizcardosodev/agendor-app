"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { navItems, othersItems } from "@/constants/navItems";

interface Breadcrumb {
  name: string;
  path: string;
  icon?: React.ReactNode;
}

interface BreadcrumbContextType {
  breadcrumbs: Breadcrumb[];
  pageTitle: string;
}

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(undefined);

export const BreadcrumbProvider = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();

  const getBreadcrumbs = () => {
    const allItems = [...navItems, ...othersItems];
    const breadcrumbs: Breadcrumb[] = [];

    // Always start with Home
    breadcrumbs.push({ name: "Home", path: "/" });

    if (pathname === "/") return breadcrumbs;

    // Find the item in navItems
    for (const item of allItems) {
      if (item.path === pathname) {
        breadcrumbs.push({ name: item.name, path: item.path, icon: item.icon });
        return breadcrumbs;
      }

      if (item.subItems) {
        const subItem = item.subItems.find((sub) => sub.path === pathname);
        if (subItem) {
          breadcrumbs.push({ name: item.name, path: item.path || "#", icon: item.icon });
          breadcrumbs.push({ name: subItem.name, path: subItem.path });
          return breadcrumbs;
        }
      }
    }

    // Handle unknown paths (optional: you could try to prettify the pathname)
    if (breadcrumbs.length === 1 && pathname !== "/") {
      const segments = pathname.split("/").filter(Boolean);
      segments.forEach((segment, index) => {
        const path = `/${segments.slice(0, index + 1).join("/")}`;
        breadcrumbs.push({
          name: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " "),
          path,
        });
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();
  const pageTitle = breadcrumbs[breadcrumbs.length - 1]?.name || "Dashboard";

  return (
    <BreadcrumbContext.Provider value={{ breadcrumbs, pageTitle }}>
      {children}
    </BreadcrumbContext.Provider>
  );
};

export const useBreadcrumbs = () => {
  const context = useContext(BreadcrumbContext);
  if (context === undefined) {
    throw new Error("useBreadcrumbs must be used within a BreadcrumbProvider");
  }
  return context;
};
