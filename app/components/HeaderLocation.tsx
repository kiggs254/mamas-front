"use client";

import { useState, useEffect } from "react";
import { LocationIcon } from "./Icons";
import { headerLocationLabel, readSelectedBranch } from "@/lib/branch-selection";
import { useBranchCartConflictState } from "./BranchCartConflictContext";
import BranchCartWarning from "./BranchCartWarning";

type Props = {
  /** Extra classes (e.g. mobile full-width row in `Header.module.css`). */
  className?: string;
};

export default function HeaderLocation({ className }: Props) {
  const [location, setLocation] = useState("Select Location");
  const branchCart = useBranchCartConflictState();

  useEffect(() => {
    const fetchLocation = () => {
      setLocation(headerLocationLabel(readSelectedBranch()));
    };

    fetchLocation();

    window.addEventListener("locationChange", fetchLocation);
    return () => window.removeEventListener("locationChange", fetchLocation);
  }, []);

  const openPicker = () => {
    window.dispatchEvent(new Event("openLocationPicker"));
  };

  return (
    <span className={className} style={{ display: "inline-flex", flexDirection: "column", alignItems: "flex-start" }}>
      <span
        role="button"
        tabIndex={0}
        onClick={openPicker}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openPicker();
          }
        }}
        style={{
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "4px",
          color: "var(--color-primary)",
          fontWeight: 600,
        }}
        title="Click to change your branch"
      >
        <LocationIcon size={13} />
        {location}
      </span>
      {branchCart?.branchesEnabledShop ? (
        <BranchCartWarning
          conflictIds={branchCart.conflictIds}
          checking={branchCart.checking}
          onProceed={branchCart.proceedRemove}
          onDismiss={branchCart.dismiss}
        />
      ) : null}
    </span>
  );
}
