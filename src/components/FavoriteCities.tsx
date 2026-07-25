import React from "react";
import { Star, MapPin } from "lucide-react";
import { LocationResult } from "../types";

export const DEFAULT_CITIES: LocationResult[] = [
  { id: 1, name: "Tokyo", latitude: 35.6895, longitude: 139.6917, country: "Japan", timezone: "Asia/Tokyo" },
  { id: 2, name: "London", latitude: 51.5074, longitude: -0.1278, country: "United Kingdom", timezone: "Europe/London" },
  { id: 3, name: "New York", latitude: 40.7128, longitude: -74.006, country: "United States", timezone: "America/New_York" },
  { id: 4, name: "Paris", latitude: 48.8566, longitude: 2.3522, country: "France", timezone: "Europe/Paris" },
  { id: 5, name: "Sydney", latitude: -33.8688, longitude: 151.2093, country: "Australia", timezone: "Australia/Sydney" },
  { id: 6, name: "Mumbai", latitude: 19.076, longitude: 72.8777, country: "India", timezone: "Asia/Kolkata" },
  { id: 7, name: "Rio de Janeiro", latitude: -22.9068, longitude: -43.1729, country: "Brazil", timezone: "America/Sao_Paulo" },
];

interface FavoriteCitiesProps {
  currentLocation: LocationResult;
  favorites: LocationResult[];
  onSelectCity: (city: LocationResult) => void;
}

export const FavoriteCities: React.FC<FavoriteCitiesProps> = ({
  currentLocation,
  favorites,
  onSelectCity,
}) => {
  const displayCities = favorites.length > 0 ? favorites : DEFAULT_CITIES;

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
      <span className="text-white/60 font-medium shrink-0 flex items-center gap-1.5 mr-1 bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
        <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
        <span>{favorites.length > 0 ? "Saved Locations:" : "Popular Cities:"}</span>
      </span>

      {displayCities.map((city) => {
        const isSelected = currentLocation.id === city.id || currentLocation.name === city.name;
        return (
          <button
            key={`${city.name}-${city.latitude}`}
            onClick={() => onSelectCity(city)}
            className={`px-4 py-1.5 rounded-full border backdrop-blur-md transition-all shrink-0 flex items-center gap-1.5 font-medium ${
              isSelected
                ? "bg-blue-500/30 border-blue-400/60 text-blue-200 shadow-lg shadow-blue-500/20"
                : "bg-white/10 border-white/15 text-white/80 hover:bg-white/20 hover:text-white"
            }`}
          >
            <MapPin className={`w-3 h-3 ${isSelected ? "text-blue-300" : "text-white/50"}`} />
            <span>{city.name}</span>
            {city.country && <span className="text-[10px] text-white/40">({city.country})</span>}
          </button>
        );
      })}
    </div>
  );
};
