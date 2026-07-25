import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// API Endpoint: Geocoding search proxy
app.get("/api/geocoding", async (req, res) => {
  try {
    const query = req.query.q as string;
    if (!query || query.trim().length < 2) {
      return res.json({ results: [] });
    }

    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        query.trim()
      )}&count=10&language=en&format=json`
    );

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.statusText}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    console.error("Geocoding error:", error);
    res.status(500).json({ error: error.message || "Failed to search location" });
  }
});

// API Endpoint: Weather forecast proxy
app.get("/api/weather", async (req, res) => {
  try {
    const { lat, lon, timezone } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({ error: "Latitude and longitude are required" });
    }

    const tz = (timezone as string) || "auto";
    const encodedTz = encodeURIComponent(tz).replace(/%2F/g, "/");
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,pressure_msl,cloud_cover,visibility,wind_speed_10m,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,rain_sum,showers_sum,snowfall_sum,precipitation_hours,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant&timezone=${encodedTz}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Open-Meteo Weather API error: ${response.statusText}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    console.error("Weather API error:", error);
    res.status(500).json({ error: error.message || "Failed to fetch weather data" });
  }
});

// API Endpoint: AI Planning & Intelligence powered by Gemini
app.post("/api/ai-intelligence", async (req, res) => {
  try {
    const { location, currentWeather, dailyForecast, hourlySummary, userQuery } = req.body;

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: "Gemini API Key is missing. Please check your environment configuration.",
      });
    }

    const prompt = `You are an expert Meteorological Intelligence & Personal Activity Planner.
Analyze the following weather data for ${location.name}, ${location.country}:

Current Weather:
- Temperature: ${currentWeather.temperature}°C (Feels like ${currentWeather.apparent_temperature}°C)
- Condition Code: ${currentWeather.weather_code}
- Wind Speed: ${currentWeather.wind_speed_10m} km/h (Gusts: ${currentWeather.wind_gusts_10m} km/h)
- Humidity: ${currentWeather.relative_humidity_2m}%
- Cloud Cover: ${currentWeather.cloud_cover}%
- Pressure: ${currentWeather.pressure_msl} hPa

Today's High/Low & Conditions:
- Max Temp: ${dailyForecast[0]?.temperature_2m_max}°C, Min Temp: ${dailyForecast[0]?.temperature_2m_min}°C
- Max UV Index: ${dailyForecast[0]?.uv_index_max}
- Max Rain Probability: ${dailyForecast[0]?.precipitation_probability_max}%
- Total Rain: ${dailyForecast[0]?.precipitation_sum} mm

Near-term Hourly Overview (Next 12 Hours):
${hourlySummary.join("\n")}

User Question/Activity Request (if any): ${userQuery ? `"${userQuery}"` : "General daily planning intelligence"}

Please provide a structured, practical, friendly Weather Intelligence Plan with the following sections in JSON format:
1. "summary": A concise 2-sentence executive summary of today's conditions and general vibe.
2. "bestOutdoorWindow": Recommended hours today for outdoor activities (e.g. "6:00 AM - 9:00 AM or 5:00 PM - 8:00 PM") with a brief reason.
3. "clothingGuide": Specific, practical advice on what to wear and carry (e.g., umbrella, sunglasses, light jacket, breathable layers).
4. "activities": Array of objects with "activity" name (e.g., "Running / Jogging", "Outdoor Dining", "Cycling", "Car Wash", "Stargazing"), "suitability" ("Excellent" | "Good" | "Fair" | "Poor"), and "tip" (short explanation).
5. "travelAdvisory": Commute & road driving conditions or safety notes.
6. "customAdvice": If the user provided a question/activity request, answer it directly and insightfully based on the data. Otherwise provide 1 proactive tip for the day.

Respond ONLY with valid JSON conforming strictly to the requested structure. Do not use Markdown code block wrapping if possible or make sure it can be parsed as JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (error: any) {
    console.error("AI Intelligence error:", error);
    res.status(500).json({ error: error.message || "Failed to generate AI weather plan" });
  }
});

// Vite middleware for dev / static serving for prod
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
