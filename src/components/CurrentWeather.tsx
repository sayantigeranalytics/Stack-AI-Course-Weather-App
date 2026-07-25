import React from "react";
import {
  Sun,
  Moon,
  Cloud,
  CloudSun,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudFog,
  Snowflake,
  Wind,
  Droplets,
  Eye,
  Gauge,
  Sunrise,
  Sunset,
  Thermometer,
  ShieldAlert,
  Calendar,
  Clock,
  Compass,
} from "lucide-react";
import { WeatherData, LocationResult, TempUnit } from "../types";
import {
  getWeatherCodeInfo,
  formatTempStr,
  getWindDirectionLabel,
  getUVIndexInfo,
} from "../utils/weatherUtils";

interface CurrentWeatherProps {
  weather: WeatherData;
  location: LocationResult;
  unit: TempUnit;
}

export const CurrentWeather: React.FC<CurrentWeatherProps> = ({
  weather,
  location,
  unit,
}) => {
  const current = weather.current;
  const today = weather.daily;
  const isDay = current.is_day === 1;
  const codeInfo = getWeatherCodeInfo(current.weather_code, isDay);

  const maxTemp = today.temperature_2m_max[0] ?? current.temperature_2m;
  const minTemp = today.temperature_2m_min[0] ?? current.temperature_2m;
  const uvMax = today.uv_index_max[0] ?? 0;
  const uvInfo = getUVIndexInfo(uvMax);

  // Sunrise and Sunset
  const sunriseStr = today.sunrise[0]
    ? new Date(today.sunrise[0]).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "--:--";
  const sunsetStr = today.sunset[0]
    ? new Date(today.sunset[0]).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "--:--";

  // Calculate daylight progress bar percentage
  let daylightPercent = 50;
  if (today.sunrise[0] && today.sunset[0]) {
    const sunriseTime = new Date(today.sunrise[0]).getTime();
    const sunsetTime = new Date(today.sunset[0]).getTime();
    const nowTime = new Date().getTime();
    if (nowTime <= sunriseTime) daylightPercent = 0;
    else if (nowTime >= sunsetTime) daylightPercent = 100;
    else daylightPercent = Math.round(((nowTime - sunriseTime) / (sunsetTime - sunriseTime)) * 100);
  }

  // Icon mapping
  const renderWeatherIcon = (iconName: string, className = "w-16 h-16") => {
    switch (iconName) {
      case "Sun":
      case "SunMedium":
        return <Sun className={`${className} text-amber-400 fill-amber-400/20 animate-spin-slow`} />;
      case "Moon":
      case "MoonStar":
        return <Moon className={`${className} text-indigo-300 fill-indigo-300/20`} />;
      case "CloudSun":
        return <CloudSun className={`${className} text-amber-300`} />;
      case "CloudDrizzle":
        return <CloudDrizzle className={`${className} text-cyan-400`} />;
      case "CloudRain":
      case "CloudRainWind":
      case "CloudHail":
        return <CloudRain className={`${className} text-sky-400 animate-bounce`} />;
      case "CloudSnow":
      case "Snowflake":
        return <Snowflake className={`${className} text-sky-200 animate-pulse`} />;
      case "CloudLightning":
        return <CloudLightning className={`${className} text-purple-400 animate-pulse`} />;
      case "CloudFog":
        return <CloudFog className={`${className} text-slate-300`} />;
      default:
        return <Cloud className={`${className} text-slate-300`} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Card */}
      <div
        className={`relative overflow-hidden rounded-[32px] p-6 sm:p-8 bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl text-white`}
      >
        {/* Subtle decorative dynamic gradient accent glow behind text */}
        <div className={`absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gradient-to-br ${codeInfo.gradient} opacity-20 blur-3xl pointer-events-none`} />
        
        <div className="relative z-10 space-y-6">
          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-white/90 text-sm font-medium">
                <Compass className="w-4 h-4 text-blue-300" />
                <span>
                  {[location.name, location.admin1, location.country].filter(Boolean).join(", ")}
                </span>
              </div>
              <p className="text-xs text-white/60 mt-1 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  Local Time: {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} • Zone: {weather.timezone_abbreviation}
                </span>
              </p>
            </div>

            {/* High / Low pill */}
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-xs font-semibold self-start sm:self-auto">
              <span className="text-amber-300 flex items-center gap-1">
                ↑ {formatTempStr(maxTemp, unit)}
              </span>
              <span className="text-white/30">|</span>
              <span className="text-sky-300 flex items-center gap-1">
                ↓ {formatTempStr(minTemp, unit)}
              </span>
            </div>
          </div>

          {/* Main Temp & Condition */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 py-2">
            <div className="flex items-baseline gap-4">
              <span className="text-6xl sm:text-7xl font-extrabold tracking-tight text-white drop-shadow-lg">
                {formatTempStr(current.temperature_2m, unit)}
              </span>
              <div className="space-y-1">
                <p className="text-xl font-semibold text-white/95">{codeInfo.label}</p>
                <p className="text-xs text-white/70">
                  Feels like <span className="font-bold text-white">{formatTempStr(current.apparent_temperature, unit)}</span>
                </p>
              </div>
            </div>

            {/* Weather Icon Visual */}
            <div className="p-5 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shrink-0 self-center sm:self-auto shadow-xl">
              {renderWeatherIcon(codeInfo.iconName, "w-16 h-16 sm:w-20 sm:h-20")}
            </div>
          </div>

          {/* Daylight Tracker Bar */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-white/90">
              <div className="flex items-center gap-1.5 text-amber-300">
                <Sunrise className="w-4 h-4" />
                <span>Sunrise {sunriseStr}</span>
              </div>
              <span className="text-white/50 text-[11px]">Sun Position</span>
              <div className="flex items-center gap-1.5 text-orange-300">
                <Sunset className="w-4 h-4" />
                <span>Sunset {sunsetStr}</span>
              </div>
            </div>
            <div className="relative w-full h-2 bg-black/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 via-orange-400 to-sky-400 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${Math.min(100, Math.max(0, daylightPercent))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Atmospheric Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Humidity */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 space-y-1 hover:bg-white/10 transition-all">
          <div className="flex items-center justify-between text-white/60 text-xs">
            <span>Humidity</span>
            <Droplets className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-xl font-bold text-white">{current.relative_humidity_2m}%</p>
          <p className="text-[11px] text-white/50">
            {current.relative_humidity_2m > 70
              ? "High humidity"
              : current.relative_humidity_2m < 30
              ? "Dry air"
              : "Optimal range"}
          </p>
        </div>

        {/* Wind */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 space-y-1 hover:bg-white/10 transition-all">
          <div className="flex items-center justify-between text-white/60 text-xs">
            <span>Wind</span>
            <Wind className="w-4 h-4 text-teal-400" />
          </div>
          <p className="text-xl font-bold text-white">{Math.round(current.wind_speed_10m)} km/h</p>
          <p className="text-[11px] text-white/50 flex items-center gap-1">
            <span>{getWindDirectionLabel(current.wind_direction_10m)}</span>
            <span>• Gusts {Math.round(current.wind_gusts_10m)} km/h</span>
          </p>
        </div>

        {/* UV Index */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 space-y-1 hover:bg-white/10 transition-all">
          <div className="flex items-center justify-between text-white/60 text-xs">
            <span>UV Index</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl font-bold text-white">{uvMax.toFixed(1)}</p>
          <span className={`text-[10px] px-2 py-0.5 rounded-full border inline-block ${uvInfo.colorClass}`}>
            {uvInfo.label}
          </span>
        </div>

        {/* Pressure */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 space-y-1 hover:bg-white/10 transition-all">
          <div className="flex items-center justify-between text-white/60 text-xs">
            <span>Pressure</span>
            <Gauge className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-xl font-bold text-white">{Math.round(current.pressure_msl)} hPa</p>
          <p className="text-[11px] text-white/50">
            {current.pressure_msl < 1008 ? "Low pressure" : "Stable pressure"}
          </p>
        </div>

        {/* Cloud Cover */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 space-y-1 hover:bg-white/10 transition-all">
          <div className="flex items-center justify-between text-white/60 text-xs">
            <span>Cloud Cover</span>
            <Cloud className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-xl font-bold text-white">{current.cloud_cover}%</p>
          <p className="text-[11px] text-white/50">
            {current.cloud_cover > 80 ? "Heavy clouds" : current.cloud_cover > 30 ? "Partly cloudy" : "Clear skies"}
          </p>
        </div>

        {/* Rain Today */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 space-y-1 hover:bg-white/10 transition-all">
          <div className="flex items-center justify-between text-white/60 text-xs">
            <span>Rain Today</span>
            <CloudRain className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-xl font-bold text-white">{today.precipitation_sum[0] ?? 0} mm</p>
          <p className="text-[11px] text-white/50">
            {today.precipitation_probability_max[0] ?? 0}% max chance
          </p>
        </div>
      </div>
    </div>
  );
};
