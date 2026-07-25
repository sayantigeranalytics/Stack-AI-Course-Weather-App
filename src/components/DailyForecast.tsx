import React, { useState } from "react";
import {
  Calendar,
  ChevronRight,
  CloudRain,
  Wind,
  Sun,
  ShieldAlert,
  Sunrise,
  Sunset,
  X,
} from "lucide-react";
import { WeatherData, TempUnit } from "../types";
import {
  getWeatherCodeInfo,
  convertTemp,
  getUVIndexInfo,
  getWindDirectionLabel,
} from "../utils/weatherUtils";

interface DailyForecastProps {
  weather: WeatherData;
  unit: TempUnit;
}

export const DailyForecast: React.FC<DailyForecastProps> = ({ weather, unit }) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);

  const daily = weather.daily;
  if (!daily || !daily.time || daily.time.length === 0) return null;

  // Global min and max across all 7 days for proper relative range bar
  const allMax = Math.max(...daily.temperature_2m_max);
  const allMin = Math.min(...daily.temperature_2m_min);
  const totalRange = Math.max(1, allMax - allMin);

  return (
    <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] p-6 space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-semibold text-white">7-Day Forecast</h2>
        </div>
        <span className="text-xs text-white/50">Click any day for details</span>
      </div>

      {/* 7 Daily Rows */}
      <div className="divide-y divide-white/10">
        {daily.time.map((timeStr, idx) => {
          const date = new Date(timeStr);
          const dayName = idx === 0 ? "Today" : date.toLocaleDateString("en-US", { weekday: "short" });
          const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

          const code = daily.weather_code[idx] ?? 0;
          const info = getWeatherCodeInfo(code, true);

          const maxC = daily.temperature_2m_max[idx] ?? 0;
          const minC = daily.temperature_2m_min[idx] ?? 0;
          const maxDisp = convertTemp(maxC, unit);
          const minDisp = convertTemp(minC, unit);

          const rainProb = daily.precipitation_probability_max[idx] ?? 0;

          // Bar positioning percentage
          const leftPercent = ((minC - allMin) / totalRange) * 100;
          const widthPercent = Math.max(10, ((maxC - minC) / totalRange) * 100);

          return (
            <div
              key={timeStr}
              onClick={() => setSelectedDayIndex(idx)}
              className="py-3.5 px-3 hover:bg-white/10 rounded-2xl transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
            >
              {/* Day & Date */}
              <div className="w-28 shrink-0">
                <p className="font-semibold text-sm text-white group-hover:text-blue-300 transition-colors">
                  {dayName}
                </p>
                <p className="text-xs text-white/50">{dateStr}</p>
              </div>

              {/* Weather Condition */}
              <div className="flex items-center gap-2 w-36 shrink-0">
                <span className="text-xs font-medium text-white/80">{info.label}</span>
              </div>

              {/* Rain prob pill */}
              <div className="w-20 shrink-0 flex items-center gap-1 text-xs text-sky-300 font-medium">
                {rainProb > 15 ? (
                  <>
                    <CloudRain className="w-3.5 h-3.5 shrink-0" />
                    <span>{rainProb}%</span>
                  </>
                ) : (
                  <span className="text-white/30 text-[11px]">Dry</span>
                )}
              </div>

              {/* Temp visual range bar */}
              <div className="flex-1 flex items-center gap-3 max-w-xs">
                <span className="text-xs text-white/50 font-medium w-8 text-right shrink-0">
                  {minDisp}°
                </span>
                <div className="relative flex-1 h-2 bg-black/30 rounded-full overflow-hidden border border-white/10">
                  <div
                    className="absolute h-full rounded-full bg-gradient-to-r from-sky-400 via-amber-400 to-orange-400 shadow-sm"
                    style={{
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`,
                    }}
                  />
                </div>
                <span className="text-xs text-white font-bold w-8 shrink-0">
                  {maxDisp}°
                </span>
              </div>

              <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-blue-300 transition-colors hidden sm:block" />
            </div>
          );
        })}
      </div>

      {/* Detail Modal for Selected Day */}
      {selectedDayIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0f172a]/90 backdrop-blur-2xl border border-white/20 rounded-[32px] max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative text-white">
            <button
              onClick={() => setSelectedDayIndex(null)}
              className="absolute top-5 right-5 p-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white/80 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Title */}
            <div>
              <p className="text-xs text-blue-400 font-semibold uppercase tracking-wider">
                Detailed Daily Overview
              </p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {new Date(daily.time[selectedDayIndex]).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </h3>
            </div>

            {/* Weather Code Info */}
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">
                  {getWeatherCodeInfo(daily.weather_code[selectedDayIndex]).label}
                </p>
                <p className="text-xs text-white/60 mt-0.5">
                  Precipitation Hours: {daily.precipitation_hours[selectedDayIndex]} hrs
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-extrabold text-amber-300">
                  {convertTemp(daily.temperature_2m_max[selectedDayIndex], unit)}°{unit}
                </span>
                <span className="text-sm text-white/60 ml-2">
                  / {convertTemp(daily.temperature_2m_min[selectedDayIndex], unit)}°{unit}
                </span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 space-y-1">
                <span className="text-white/60">Rain Probability</span>
                <p className="text-lg font-bold text-sky-300">
                  {daily.precipitation_probability_max[selectedDayIndex]}%
                </p>
              </div>

              <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 space-y-1">
                <span className="text-white/60">Total Rainfall</span>
                <p className="text-lg font-bold text-white">
                  {daily.precipitation_sum[selectedDayIndex]} mm
                </p>
              </div>

              <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 space-y-1">
                <span className="text-white/60">Max UV Index</span>
                <p className="text-lg font-bold text-amber-300">
                  {daily.uv_index_max[selectedDayIndex].toFixed(1)} (
                  {getUVIndexInfo(daily.uv_index_max[selectedDayIndex]).label})
                </p>
              </div>

              <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 space-y-1">
                <span className="text-white/60">Max Wind Gusts</span>
                <p className="text-lg font-bold text-teal-300">
                  {Math.round(daily.wind_gusts_10m_max[selectedDayIndex])} km/h (
                  {getWindDirectionLabel(daily.wind_direction_10m_dominant[selectedDayIndex])})
                </p>
              </div>
            </div>

            {/* Sunrise / Sunset */}
            <div className="flex items-center justify-around p-3.5 bg-white/5 rounded-2xl border border-white/10 text-xs">
              <div className="flex items-center gap-2 text-amber-300 font-medium">
                <Sunrise className="w-4 h-4" />
                <span>
                  Sunrise:{" "}
                  {new Date(daily.sunrise[selectedDayIndex]).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2 text-orange-300 font-medium">
                <Sunset className="w-4 h-4" />
                <span>
                  Sunset:{" "}
                  {new Date(daily.sunset[selectedDayIndex]).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
