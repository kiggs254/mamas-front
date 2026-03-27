"use client";

import { useState, useEffect } from "react";
import { LocationIcon } from "./Icons";
import { headerLocationLabel, readSelectedBranch } from "@/lib/branch-selection";

type Props = {
  /** Extra classes (e.g. mobile full-width row in `Header.module.css`). */
  className?: string;
};

export default function HeaderLocation({ className }: Props) {
  const [location, setLocation] = useState("Select Location");

  useEffect(() => {
    const fetchLocation = () => {
      setLocation(headerLocationLabel(readSelectedBranch()));
    };
    
    // Initial fetch
    fetchLocation();
    
    // Listen for custom event when location changes
    window.addEventListener("locationChange", fetchLocation);
    return () => window.removeEventListener("locationChange", fetchLocation);
  }, []);

  const openPicker = () => {
    window.dispatchEvent(new Event("openLocationPicker"));
  };

  return (
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
      className={className}
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
  );
}
