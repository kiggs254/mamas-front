"use client";

import { useEffect } from "react";
import { readSelectedBranch, syncBranchCookieFromSelection } from "@/lib/branch-selection";

/** Mirrors selected branch from localStorage into a cookie so server components can pass branch_id to the API. */
export default function BranchCookieSync() {
  useEffect(() => {
    syncBranchCookieFromSelection(readSelectedBranch());
  }, []);
  return null;
}
