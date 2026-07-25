import React, { useState } from "react";
import { Clock, TrendingUp, CloudRain, Wind } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { WeatherData, TempUnit } from "../types";
import { getWeatherCodeInfo, convertTemp } from "../utils/weatherUtils";

interface HourlyForecastProps {
  weather: WeatherData;
  unit: TempUnit;
}

export const HourlyForecast: React.FC<HourlyForecastProps> = ({ weather, unit }) => {
  const [activeChart, setActiveChart] = useState<"temp" | "rain" | "wind">("temp");

  const hourly = weather.hourly;
  if (!hourly || !hourly.time || hourly.time.length === 0) return null;

  // Find index corresponding to current hour or start from index 0
  const nowISO = new Date().toISOString().slice(0, 13);
  let startIndex = hourly.time.findIndex((t) => t.slice(0, 13) === nowISO);
  if (startIndex < 0) startIndex = 0;

  // Slice next 24 hours
  const next24Times = hourly.time.slice(startIndex, startIndex + 24);

  const hourlyItems = next24Times.map((timeStr, idx) => {
    const realIdx = startIndex + idx;
    const dateObj = new Date(timeStr);
    const hourFormatted = dateObj.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    const isNow = idx === 0;

    const tempC = hourly.temperature_2m[realIdx] ?? 0;
    const tempDisp = convertTemp(tempC, unit);
    const code = hourly.weather_code[realIdx] ?? 0;
    const info = getWeatherCodeInfo(code, true);
    const rainProb = hourly.precipitation_probability[realIdx] ?? 0;
    const windSpeed = Math.round(hourly.wind_speed_10m[realIdx] ?? 0);

    return {
      hourFormatted,
      fullTime: timeStr,
      tempC,
      tempDisp,
      rainProb,
      windSpeed,
      code,
      info,
      isNow,
    };
  });

  return (
    <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] p-6 space-y-6">
      {/* Header & Chart Mode Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-semibold text-white">Hourly Forecast</h2>
          <span className="text-xs text-white/50 font-normal">Next 24 Hours</span>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center bg-white/10 backdrop-blur-md p-1 rounded-full border border-white/15 self-start sm:self-auto text-xs">
          <button
            onClick={() => setActiveChart("temp")}
            className={`px-3.5 py-1.5 rounded-full font-medium transition-all flex items-center gap-1.5 ${
              activeChart === "temp"
                ? "bg-blue-500/40 text-white shadow-md border border-blue-400/40"
                : "text-white/60 hover:text-white"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Temp (°{unit})</span>
          </button>
          <button
            onClick={() => setActiveChart("rain")}
            className={`px-3.5 py-1.5 rounded-full font-medium transition-all flex items-center gap-1.5 ${
              activeChart === "rain"
                ? "bg-blue-500/40 text-white shadow-md border border-blue-400/40"
                : "text-white/60 hover:text-white"
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" />
            <span>Precipitation (%)</span>
          </button>
          <button
            onClick={() => setActiveChart("wind")}
            className={`px-3.5 py-1.5 rounded-full font-medium transition-all flex items-center gap-1.5 ${
              activeChart === "wind"
                ? "bg-blue-500/40 text-white shadow-md border border-blue-400/40"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            <span>Wind (km/h)</span>
          </button>
        </div>
      </div>

      {/* Horizontal Scrollable Hourly Cards */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
        {hourlyItems.map((item, idx) => (
          <div
            key={`${item.fullTime}-${idx}`}
            className={`shrink-0 w-24 p-3.5 rounded-2xl border text-center space-y-2 backdrop-blur-md transition-all ${
              item.isNow
                ? "bg-blue-500/30 border-blue-400/60 shadow-lg shadow-blue-500/20 text-white"
                : "bg-white/5 border-white/10 hover:bg-white/10 text-white/80"
            }`}
          >
            <p className="text-xs font-semibold text-white/90">
              {item.isNow ? "Now" : item.hourFormatted}
            </p>
            <div className="text-xs font-medium text-white/60 truncate px-1">
              {item.info.label}
            </div>
            <p className="text-lg font-bold text-white">
              {item.tempDisp}°
            </p>
            <div className="flex items-center justify-center gap-1 text-[11px] text-sky-300 font-medium">
              <CloudRain className="w-3 h-3 shrink-0" />
              <span>{item.rainProb}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Recharts Visualization */}
      <div className="h-60 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {activeChart === "temp" ? (
            <AreaChart data={hourlyItems} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="hourFormatted" stroke="rgba(255,255,255,0.5)" fontSize={11} tickLine={false} />
              <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} tickLine={false} domain={["auto", "auto"]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.95)",
                  borderColor: "rgba(255, 255, 255, 0.2)",
                  borderRadius: "16px",
                  backdropFilter: "blur(12px)",
                  color: "#f8fafc",
                }}
                formatter={(val: any) => [`${val}°${unit}`, "Temperature"]}
              />
              <Area
                type="monotone"
                dataKey="tempDisp"
                stroke="#38bdf8"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#tempGradient)"
              />
            </AreaChart>
          ) : activeChart === "rain" ? (
            <BarChart data={hourlyItems} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="hourFormatted" stroke="rgba(255,255,255,0.5)" fontSize={11} tickLine={false} />
              <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} tickLine={false} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.95)",
                  borderColor: "rgba(255, 255, 255, 0.2)",
                  borderRadius: "16px",
                  backdropFilter: "blur(12px)",
                  color: "#f8fafc",
                }}
                formatter={(val: any) => [`${val}%`, "Precipitation Probability"]}
              />
              <Bar dataKey="rainProb" fill="#38bdf8" radius={[6, 6, 0, 0]} />
            </BarChart>
          ) : (
            <AreaChart data={hourlyItems} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="windGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="hourFormatted" stroke="rgba(255,255,255,0.5)" fontSize={11} tickLine={false} />
              <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} tickLine={false} domain={[0, "auto"]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.95)",
                  borderColor: "rgba(255, 255, 255, 0.2)",
                  borderRadius: "16px",
                  backdropFilter: "blur(12px)",
                  color: "#f8fafc",
                }}
                formatter={(val: any) => [`${val} km/h`, "Wind Speed"]}
              />
              <Area
                type="monotone"
                dataKey="windSpeed"
                stroke="#2dd4bf"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#windGradient)"
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
