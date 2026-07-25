import React, { useState, useEffect } from "react";
import { LocationResult, WeatherData, TempUnit } from "./types";
import { Header } from "./components/Header";
import { FavoriteCities, DEFAULT_CITIES } from "./components/FavoriteCities";
import { CurrentWeather } from "./components/CurrentWeather";
import { HourlyForecast } from "./components/HourlyForecast";
import { DailyForecast } from "./components/DailyForecast";
import { PlanningRecommendations } from "./components/PlanningRecommendations";
import { AlertCircle, RefreshCw, Compass } from "lucide-react";

export default function App() {
  const [currentLocation, setCurrentLocation] = useState<LocationResult>(DEFAULT_CITIES[0]);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [unit, setUnit] = useState<TempUnit>("C");
  const [favorites, setFavorites] = useState<LocationResult[]>(() => {
    try {
      const saved = localStorage.getItem("weather_favorites");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Save favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("weather_favorites", JSON.stringify(favorites));
    } catch (e) {
      console.error("Failed to save favorites to localStorage", e);
    }
  }, [favorites]);

  // Fetch weather data when location changes
  const fetchWeather = async (loc: LocationResult) => {
    setIsLoading(true);
    setError(null);
    try {
      const url = `/api/weather?lat=${loc.latitude}&lon=${loc.longitude}&timezone=${encodeURIComponent(
        loc.timezone || "auto"
      )}`;
      const res = await fetch(url);
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Failed to load weather forecast");
      }
      const data: WeatherData = await res.json();
      setWeatherData(data);
    } catch (err: any) {
      console.error("Error loading weather:", err);
      setError(err.message || "Failed to load weather data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(currentLocation);
  }, [currentLocation]);

  // Detect GPS location
  const handleCurrentLocationClick = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          // Reverse lookup or use coordinates directly
          const newLoc: LocationResult = {
            id: Date.now(),
            name: "Current Location",
            latitude,
            longitude,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "auto",
          };
          setCurrentLocation(newLoc);
        } catch (e) {
          console.error("GPS location setup error:", e);
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
        alert("Unable to retrieve your location. Please check browser permissions.");
        setIsLocating(false);
      }
    );
  };

  // Toggle Favorite
  const isCurrentFavorite = favorites.some(
    (f) => f.name === currentLocation.name || f.id === currentLocation.id
  );

  const handleToggleFavorite = () => {
    if (isCurrentFavorite) {
      setFavorites((prev) =>
        prev.filter((f) => f.name !== currentLocation.name && f.id !== currentLocation.id)
      );
    } else {
      setFavorites((prev) => [...prev, currentLocation]);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 font-sans antialiased selection:bg-blue-500 selection:text-white pb-12 relative overflow-x-hidden">
      {/* Background Mesh Gradient Glows for Frosted Glass Theme */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-40 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-500 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] left-[30%] w-[400px] h-[400px] bg-purple-500 rounded-full blur-[100px]" />
      </div>

      {/* Navigation Header */}
      <div className="relative z-10">
        <Header
          currentLocation={currentLocation}
          onSelectLocation={setCurrentLocation}
          unit={unit}
          onToggleUnit={() => setUnit((prev) => (prev === "C" ? "F" : "C"))}
          isFavorite={isCurrentFavorite}
          onToggleFavorite={handleToggleFavorite}
          onCurrentLocationClick={handleCurrentLocationClick}
          isLocating={isLocating}
        />
      </div>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Favorite & Quick Cities Selector */}
        <FavoriteCities
          currentLocation={currentLocation}
          favorites={favorites}
          onSelectCity={setCurrentLocation}
        />

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-white/70 text-sm font-medium animate-pulse">
              Fetching weather metrics for {currentLocation.name}...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="p-8 bg-rose-500/10 backdrop-blur-xl border border-rose-500/30 rounded-[32px] text-center space-y-4">
            <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-rose-300">Weather Load Error</h3>
              <p className="text-sm text-slate-300">{error}</p>
            </div>
            <button
              onClick={() => fetchWeather(currentLocation)}
              className="px-5 py-2.5 bg-rose-500/80 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-2 transition-all shadow-lg"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Main Dashboard when loaded */}
        {!isLoading && !error && weatherData && (
          <div className="space-y-8">
            {/* Top Section: Current Weather Hero & Atmospheric Metrics */}
            <CurrentWeather weather={weatherData} location={currentLocation} unit={unit} />

            {/* Middle Section: Hourly Forecast & Recharts */}
            <HourlyForecast weather={weatherData} unit={unit} />

            {/* Bottom Section: 7-Day Forecast & AI Planning Recommendations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <DailyForecast weather={weatherData} unit={unit} />
              <PlanningRecommendations weather={weatherData} location={currentLocation} />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 text-center text-xs text-white/40 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-white/10 pt-6">
        <p className="flex items-center gap-1.5">
          <span>Powered by</span>
          <span className="font-semibold text-white/70">Open-Meteo API</span>
          <span>&</span>
          <span className="font-semibold text-amber-300">Google Gemini AI</span>
        </p>
        <p>© 2026 Weather Intelligence. Frosted Glass Meteorological Dashboard.</p>
      </footer>
    </div>
  );
}
