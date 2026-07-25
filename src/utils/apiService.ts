import { WeatherData, LocationResult, AIWeatherIntelligence } from "../types";

/**
 * Robustly fetch weather data.
 * Tries the local backend `/api/weather` endpoint first.
 * If running on a static host (like Cloudflare Pages, Vercel SPA, GitHub Pages)
 * where `/api/weather` returns static HTML (`<!doctype html>`), it seamlessly
 * falls back to calling the Open-Meteo Forecast API directly from the client.
 */
export async function fetchWeatherData(
  latitude: number,
  longitude: number,
  timezone: string = "auto"
): Promise<WeatherData> {
  const localUrl = `/api/weather?lat=${latitude}&lon=${longitude}&timezone=${encodeURIComponent(
    timezone
  )}`;

  try {
    const res = await fetch(localUrl);
    const contentType = res.headers.get("content-type") || "";

    if (res.ok && contentType.includes("application/json")) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    console.warn("Backend proxy /api/weather unavailable, falling back to direct Open-Meteo API:", err);
  }

  // Fallback: Direct client fetch from Open-Meteo Forecast API
  const encodedTz = encodeURIComponent(timezone || "auto").replace(/%2F/g, "/");
  const directUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,pressure_msl,cloud_cover,visibility,wind_speed_10m,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,rain_sum,showers_sum,snowfall_sum,precipitation_hours,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant&timezone=${encodedTz}`;

  const response = await fetch(directUrl);
  if (!response.ok) {
    throw new Error(`Open-Meteo API error: ${response.statusText}`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new Error("Invalid response format received from weather API.");
  }

  const data: WeatherData = await response.json();
  return data;
}

/**
 * Robustly fetch geocoding location search results.
 * Tries `/api/geocoding` first, falling back to Open-Meteo Geocoding API on static hosts.
 */
export async function fetchGeocodingResults(query: string): Promise<LocationResult[]> {
  if (!query.trim() || query.length < 2) return [];

  const localUrl = `/api/geocoding?q=${encodeURIComponent(query)}`;

  try {
    const res = await fetch(localUrl);
    const contentType = res.headers.get("content-type") || "";

    if (res.ok && contentType.includes("application/json")) {
      const data = await res.json();
      return data.results || [];
    }
  } catch (err) {
    console.warn("Backend proxy /api/geocoding unavailable, falling back to direct Open-Meteo Geocoding API:", err);
  }

  // Fallback: Direct client fetch from Open-Meteo Geocoding API
  const directUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    query
  )}&count=8&language=en&format=json`;

  const response = await fetch(directUrl);
  if (!response.ok) {
    return [];
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return [];
  }

  const data = await response.json();
  return data.results || [];
}

/**
 * Fetch AI intelligence recommendations via backend proxy `/api/ai-intelligence`.
 * Safely handles static hosts where server routes do not exist.
 */
export async function fetchAiIntelligence(payload: any): Promise<AIWeatherIntelligence> {
  const res = await fetch("/api/ai-intelligence", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const contentType = res.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    throw new Error("AI server route is not available in static hosting mode. Showing rule-based weather insights.");
  }

  if (!res.ok) {
    let errorMessage = "Failed to generate AI plan";
    try {
      const errJson = await res.json();
      errorMessage = errJson.error || errorMessage;
    } catch {
      // Ignore JSON parse error on error response
    }
    throw new Error(errorMessage);
  }

  return await res.json();
}
