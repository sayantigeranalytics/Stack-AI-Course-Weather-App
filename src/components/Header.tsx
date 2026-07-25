import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, Compass, Sparkles, Heart, Check } from "lucide-react";
import { LocationResult, TempUnit } from "../types";
import { fetchGeocodingResults } from "../utils/apiService";

interface HeaderProps {
  currentLocation: LocationResult;
  onSelectLocation: (loc: LocationResult) => void;
  unit: TempUnit;
  onToggleUnit: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onCurrentLocationClick: () => void;
  isLocating: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentLocation,
  onSelectLocation,
  unit,
  onToggleUnit,
  isFavorite,
  onToggleFavorite,
  onCurrentLocationClick,
  isLocating,
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounced geocoding search
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      setIsLoading(false);
      setSelectedIndex(-1);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const locations = await fetchGeocodingResults(query);
        setResults(locations);
        setIsOpen(locations.length > 0);
        setSelectedIndex(-1);
      } catch (err) {
        console.error("Failed to fetch geocoding results:", err);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (loc: LocationResult) => {
    onSelectLocation(loc);
    setQuery("");
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const targetLoc = selectedIndex >= 0 ? results[selectedIndex] : results[0];
      if (targetLoc) {
        handleSelect(targetLoc);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-2xl bg-white/5 border-b border-white/10 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand logo & title */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/10">
            <Compass className="w-5 h-5 text-blue-300 animate-pulse" />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-semibold text-lg tracking-tight leading-none text-white flex items-center gap-1.5">
              Weather<span className="text-blue-400">Intelligence</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            </h1>
            <p className="text-[11px] text-white/50 mt-1">Live Open-Meteo & AI Insights</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 max-w-md" ref={searchRef}>
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-4 h-4 text-white/50 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.length >= 2 && setIsOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder="Search city, region, or country..."
              className="w-full pl-11 pr-10 py-2.5 text-sm bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all"
            />
            {isLoading && (
              <div className="absolute right-3.5 w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {isOpen && results.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#0f172a]/95 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden z-50 divide-y divide-white/10 max-h-80 overflow-y-auto">
              {results.map((loc, idx) => (
                <button
                  key={`${loc.id}-${loc.latitude}-${loc.longitude}-${idx}`}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(loc);
                  }}
                  onClick={() => handleSelect(loc)}
                  className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center justify-between text-white/90 ${
                    selectedIndex === idx ? "bg-blue-500/30 text-white" : "hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                    <div className="truncate">
                      <span className="font-semibold text-white">{loc.name}</span>
                      <span className="text-white/60 text-xs ml-1.5">
                        {[loc.admin1, loc.country].filter(Boolean).join(", ")}
                      </span>
                    </div>
                  </div>
                  {loc.country_code && (
                    <span className="text-xs px-2 py-0.5 rounded-md bg-white/10 text-white/70 font-mono border border-white/10 shrink-0 ml-2">
                      {loc.country_code}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Use current GPS location button */}
          <button
            onClick={onCurrentLocationClick}
            disabled={isLocating}
            title="Use current GPS location"
            className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white/80 hover:text-white hover:bg-white/20 transition-all disabled:opacity-50"
          >
            <MapPin className={`w-4 h-4 ${isLocating ? "animate-bounce text-blue-400" : ""}`} />
          </button>

          {/* Toggle Favorite */}
          <button
            onClick={onToggleFavorite}
            title={isFavorite ? "Remove from favorites" : "Save to favorites"}
            className={`p-2.5 rounded-2xl backdrop-blur-md border transition-all ${
              isFavorite
                ? "bg-rose-500/20 border-rose-400/40 text-rose-300 hover:bg-rose-500/30"
                : "bg-white/10 border-white/20 text-white/60 hover:text-rose-300 hover:bg-white/20"
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? "fill-rose-400 text-rose-400" : ""}`} />
          </button>

          {/* Unit Toggle °C / °F */}
          <div className="flex items-center bg-white/10 backdrop-blur-md p-1 rounded-2xl border border-white/20">
            <button
              onClick={onToggleUnit}
              className={`px-3 py-1 text-xs font-semibold rounded-xl transition-all ${
                unit === "C"
                  ? "bg-blue-500 text-white shadow-md"
                  : "text-white/60 hover:text-white"
              }`}
            >
              °C
            </button>
            <button
              onClick={onToggleUnit}
              className={`px-3 py-1 text-xs font-semibold rounded-xl transition-all ${
                unit === "F"
                  ? "bg-blue-500 text-white shadow-md"
                  : "text-white/60 hover:text-white"
              }`}
            >
              °F
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
