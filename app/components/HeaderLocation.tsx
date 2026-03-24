"use client";

import { useState, useEffect } from 'react';
import { LocationIcon } from './Icons';

export default function HeaderLocation() {
  const [location, setLocation] = useState("Select Location");

  useEffect(() => {
    const fetchLocation = () => {
      const stored = localStorage.getItem("cleanshelf_location");
      if (stored) {
        setLocation(stored);
      } else {
        setLocation("Select Location");
      }
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
      onClick={openPicker} 
      style={{ 
        cursor: 'pointer', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '4px',
        color: 'var(--color-primary)',
        fontWeight: 600
      }}
      title="Click to change your branch"
    >
      <LocationIcon size={13} /> 
      {location}
    </span>
  );
}
