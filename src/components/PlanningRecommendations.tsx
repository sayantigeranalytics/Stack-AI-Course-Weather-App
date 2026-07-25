import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Shirt,
  Compass,
  Car,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RefreshCw,
} from "lucide-react";
import { WeatherData, LocationResult, AIWeatherIntelligence } from "../types";
import { generateRuleBasedIntelligence } from "../utils/weatherUtils";
import { fetchAiIntelligence } from "../utils/apiService";

interface PlanningRecommendationsProps {
  weather: WeatherData;
  location: LocationResult;
}

export const PlanningRecommendations: React.FC<PlanningRecommendationsProps> = ({
  weather,
  location,
}) => {
  const [userQuery, setUserQuery] = useState("");
  const [aiIntelligence, setAiIntelligence] = useState<AIWeatherIntelligence | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Reset AI intelligence when location changes
  useEffect(() => {
    setAiIntelligence(null);
    setErrorMsg(null);
  }, [location.latitude, location.longitude, location.name]);

  // Default rule-based fallback intelligence
  const ruleBased = generateRuleBasedIntelligence(weather, location.name);
  const activePlan = aiIntelligence || ruleBased;

  const fetchAiPlan = async (customPrompt?: string) => {
    setIsGenerating(true);
    setErrorMsg(null);

    try {
      // Prepare near-term hourly summary for Gemini
      const hourlySummary: string[] = [];
      const hourly = weather.hourly;
      if (hourly && hourly.time) {
        for (let i = 0; i < Math.min(12, hourly.time.length); i++) {
          const t = new Date(hourly.time[i]).toLocaleTimeString([], {
            hour: "numeric",
          });
          hourlySummary.push(
            `${t}: ${hourly.temperature_2m[i]}°C, Rain Prob: ${hourly.precipitation_probability[i]}%, Wind: ${hourly.wind_speed_10m[i]} km/h`
          );
        }
      }

      const data = await fetchAiIntelligence({
        location,
        currentWeather: weather.current,
        dailyForecast: weather.daily,
        hourlySummary,
        userQuery: customPrompt || userQuery,
      });

      setAiIntelligence(data);
    } catch (err: any) {
      console.error("AI plan error:", err);
      setErrorMsg(err.message || "Could not fetch AI plan. Showing rule-based recommendations.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuery.trim()) return;
    fetchAiPlan(userQuery);
  };

  const getSuitabilityBadge = (suitability: string) => {
    switch (suitability) {
      case "Excellent":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/40";
      case "Good":
        return "bg-sky-500/20 text-sky-400 border-sky-500/40";
      case "Fair":
        return "bg-amber-500/20 text-amber-400 border-amber-500/40";
      default:
        return "bg-rose-500/20 text-rose-400 border-rose-500/40";
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              Weather Intelligence & Planning
              {aiIntelligence && (
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-mono">
                  Gemini AI
                </span>
              )}
            </h2>
            <p className="text-xs text-white/50">
              Personalized activity indexes, clothing guides, and travel advisories
            </p>
          </div>
        </div>

        {/* Generate AI Plan Button */}
        <button
          onClick={() => fetchAiPlan()}
          disabled={isGenerating}
          className="px-4 py-2.5 rounded-full bg-blue-500/30 hover:bg-blue-500/40 border border-blue-400/40 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all shrink-0 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`} />
          <span>{isGenerating ? "Analyzing Weather..." : "Ask Gemini AI Insights"}</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-3.5 bg-amber-500/10 border border-amber-400/30 rounded-2xl text-amber-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Summary Banner */}
      <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 space-y-2">
        <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">
          Executive Summary
        </span>
        <p className="text-sm text-white/90 leading-relaxed">{activePlan.summary}</p>
      </div>

      {/* Grid of Key Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Best Outdoor Time Window */}
        <div className="p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center gap-2 text-sky-300 text-xs font-semibold">
            <Clock className="w-4 h-4" />
            <span>Optimal Outdoor Window</span>
          </div>
          <p className="text-sm font-medium text-white">{activePlan.bestOutdoorWindow}</p>
        </div>

        {/* Clothing Guide */}
        <div className="p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold">
            <Shirt className="w-4 h-4" />
            <span>Clothing & Gear</span>
          </div>
          <p className="text-sm font-medium text-white">{activePlan.clothingGuide}</p>
        </div>

        {/* Travel & Commute Advisory */}
        <div className="p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold">
            <Car className="w-4 h-4" />
            <span>Commute & Travel</span>
          </div>
          <p className="text-sm font-medium text-white">{activePlan.travelAdvisory}</p>
        </div>
      </div>

      {/* Activity Suitability Matrix */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-white/90 flex items-center gap-2">
          <Compass className="w-4 h-4 text-blue-400" />
          <span>Outdoor Activity Suitability Index</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {activePlan.activities.map((act, i) => (
            <div
              key={`${act.activity}-${i}`}
              className="p-3.5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 flex items-start justify-between gap-3"
            >
              <div className="space-y-1 min-w-0">
                <p className="font-semibold text-sm text-white truncate">{act.activity}</p>
                <p className="text-xs text-white/60">{act.tip}</p>
              </div>
              <span
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border shrink-0 ${getSuitabilityBadge(
                  act.suitability
                )}`}
              >
                {act.suitability}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Custom AI Query Ask Form */}
      <div className="pt-2 border-t border-white/10 space-y-3">
        <label className="text-xs font-medium text-white/80 flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-blue-300" />
          <span>Ask Gemini AI for Custom Planning Advice</span>
        </label>
        <form onSubmit={handleCustomSubmit} className="flex gap-2">
          <input
            type="text"
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            placeholder="e.g. 'Can I host an outdoor barbecue at 5pm?' or 'Is morning jogging safe?'"
            className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-5 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
          />
          <button
            type="submit"
            disabled={isGenerating || !userQuery.trim()}
            className="px-5 py-2.5 rounded-full bg-blue-500 hover:bg-blue-400 text-white text-xs font-semibold flex items-center gap-2 transition-all disabled:opacity-50 shrink-0 shadow-lg"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ask AI</span>
          </button>
        </form>

        {activePlan.customAdvice && (
          <div className="p-4 bg-blue-500/15 backdrop-blur-md border border-blue-400/30 rounded-2xl space-y-1">
            <span className="text-xs font-bold text-blue-200">Custom Answer:</span>
            <p className="text-xs text-white/90 leading-relaxed">{activePlan.customAdvice}</p>
          </div>
        )}
      </div>
    </div>
  );
};
