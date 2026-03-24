"use client";

import { useState, useEffect } from "react";
import styles from "./LocationPicker.module.css";
import { SearchIcon } from "./Icons";

const LOCATIONS = [
  "Qwetu Riverside",
  "Covo Lavington",
  "Ngong",
  "Greenpark",
  "South B",
  "K-Mall",
  "Nakuru"
];

export default function LocationPicker() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    // Check if user has already selected a location.
    const selectedLocation = localStorage.getItem("cleanshelf_location");
    if (!selectedLocation) {
      // Small delay just to let the page render first before showing modal
      timer = setTimeout(() => setIsOpen(true), 500);
    }
    
    const openModal = () => setIsOpen(true);
    window.addEventListener("openLocationPicker", openModal);

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener("openLocationPicker", openModal);
    };
  }, []);

  const handleSelect = (location: string) => {
    localStorage.setItem("cleanshelf_location", location);
    setIsOpen(false);
    // Optionally trigger a re-render/event to update global location state
    window.dispatchEvent(new Event("locationChange"));
  };

  const filteredLocations = LOCATIONS.filter(loc => 
    loc.toLowerCase().includes(search.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Choose a store close to you</h2>
          <p className={styles.subtitle}>Select a store close near your area.</p>
        </div>

        {/* Search */}
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>
            <SearchIcon size={20} />
          </span>
          <input 
            type="text" 
            className={styles.searchInput}
            placeholder="Search store near you.."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* List Header */}
        <div className={styles.listHeader}>
          Select a Location
        </div>

        {/* Locations List */}
        <div className={styles.locationsList}>
          {filteredLocations.map(location => (
            <div key={location} className={styles.locationItem}>
              <span className={styles.locationName}>{location}</span>
              <button 
                className={styles.selectBtn}
                onClick={() => handleSelect(location)}
              >
                Select
              </button>
            </div>
          ))}
          {filteredLocations.length === 0 && (
            <div style={{ color: 'var(--color-text)', fontSize: '14px', textAlign: 'center', marginTop: '20px' }}>
              No stores found matching "{search}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
