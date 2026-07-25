import { TempUnit, WeatherData, AIWeatherIntelligence } from "../types";

export interface WeatherCodeInfo {
  label: string;
  iconName: string;
  category: "clear" | "cloudy" | "fog" | "drizzle" | "rain" | "snow" | "thunderstorm";
  gradient: string;
  bgCard: string;
}

export function getWeatherCodeInfo(code: number, isDay: boolean = true): WeatherCodeInfo {
  switch (code) {
    case 0:
      return {
        label: isDay ? "Clear Sky" : "Clear Night",
        iconName: isDay ? "Sun" : "Moon",
        category: "clear",
        gradient: isDay
          ? "from-amber-400 via-orange-400 to-sky-500"
          : "from-slate-900 via-indigo-950 to-slate-900",
        bgCard: isDay ? "bg-amber-500/10 border-amber-500/20" : "bg-indigo-500/10 border-indigo-500/20",
      };
    case 1:
      return {
        label: "Mainly Clear",
        iconName: isDay ? "SunMedium" : "MoonStar",
        category: "clear",
        gradient: isDay
          ? "from-amber-300 via-sky-400 to-blue-500"
          : "from-slate-900 via-slate-800 to-indigo-950",
        bgCard: "bg-sky-500/10 border-sky-500/20",
      };
    case 2:
      return {
        label: "Partly Cloudy",
        iconName: "CloudSun",
        category: "cloudy",
        gradient: isDay
          ? "from-sky-400 via-blue-500 to-indigo-500"
          : "from-slate-900 via-slate-800 to-slate-900",
        bgCard: "bg-blue-500/10 border-blue-500/20",
      };
    case 3:
      return {
        label: "Overcast",
        iconName: "Cloud",
        category: "cloudy",
        gradient: "from-slate-600 via-slate-700 to-zinc-800",
        bgCard: "bg-slate-500/10 border-slate-500/20",
      };
    case 45:
    case 48:
      return {
        label: "Foggy & Mist",
        iconName: "CloudFog",
        category: "fog",
        gradient: "from-slate-500 via-zinc-600 to-slate-700",
        bgCard: "bg-zinc-500/10 border-zinc-500/20",
      };
    case 51:
    case 53:
    case 55:
      return {
        label: "Light Drizzle",
        iconName: "CloudDrizzle",
        category: "drizzle",
        gradient: "from-cyan-600 via-blue-600 to-slate-700",
        bgCard: "bg-cyan-500/10 border-cyan-500/20",
      };
    case 56:
    case 57:
      return {
        label: "Freezing Drizzle",
        iconName: "CloudSnow",
        category: "snow",
        gradient: "from-teal-600 via-cyan-700 to-slate-800",
        bgCard: "bg-teal-500/10 border-teal-500/20",
      };
    case 61:
    case 63:
    case 65:
      return {
        label: code === 61 ? "Slight Rain" : code === 63 ? "Moderate Rain" : "Heavy Rain",
        iconName: "CloudRain",
        category: "rain",
        gradient: "from-blue-600 via-indigo-700 to-slate-800",
        bgCard: "bg-blue-500/10 border-blue-500/20",
      };
    case 66:
    case 67:
      return {
        label: "Freezing Rain",
        iconName: "CloudHail",
        category: "rain",
        gradient: "from-slate-700 via-indigo-800 to-blue-900",
        bgCard: "bg-indigo-500/10 border-indigo-500/20",
      };
    case 71:
    case 73:
    case 75:
    case 77:
      return {
        label: code === 71 ? "Slight Snow" : code === 73 ? "Moderate Snow" : "Heavy Snowfall",
        iconName: "Snowflake",
        category: "snow",
        gradient: "from-indigo-400 via-sky-600 to-slate-800",
        bgCard: "bg-sky-400/10 border-sky-400/20",
      };
    case 80:
    case 81:
    case 82:
      return {
        label: "Rain Showers",
        iconName: "CloudRainWind",
        category: "rain",
        gradient: "from-sky-600 via-blue-700 to-indigo-800",
        bgCard: "bg-sky-500/10 border-sky-500/20",
      };
    case 85:
    case 86:
      return {
        label: "Snow Showers",
        iconName: "CloudSnow",
        category: "snow",
        gradient: "from-blue-400 via-indigo-600 to-slate-800",
        bgCard: "bg-blue-400/10 border-blue-400/20",
      };
    case 95:
    case 96:
    case 99:
      return {
        label: "Thunderstorm",
        iconName: "CloudLightning",
        category: "thunderstorm",
        gradient: "from-purple-800 via-indigo-900 to-slate-900",
        bgCard: "bg-purple-500/10 border-purple-500/20",
      };
    default:
      return {
        label: "Variable Weather",
        iconName: "Cloud",
        category: "cloudy",
        gradient: "from-slate-600 via-blue-600 to-slate-800",
        bgCard: "bg-slate-500/10 border-slate-500/20",
      };
  }
}

export function convertTemp(celsius: number, unit: TempUnit): number {
  if (unit === "F") {
    return Math.round((celsius * 9) / 5 + 32);
  }
  return Math.round(celsius);
}

export function formatTempStr(celsius: number, unit: TempUnit): string {
  return `${convertTemp(celsius, unit)}°${unit}`;
}

export function getWindDirectionLabel(deg: number): string {
  const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const index = Math.round(deg / 22.5) % 16;
  return directions[index];
}

export function getUVIndexInfo(uv: number): { label: string; colorClass: string; desc: string } {
  if (uv <= 2) {
    return { label: "Low", colorClass: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30", desc: "No protection required." };
  } else if (uv <= 5) {
    return { label: "Moderate", colorClass: "text-amber-500 bg-amber-500/10 border-amber-500/30", desc: "Wear sunglasses & SPF 30+." };
  } else if (uv <= 7) {
    return { label: "High", colorClass: "text-orange-500 bg-orange-500/10 border-orange-500/30", desc: "Seek shade during midday." };
  } else if (uv <= 10) {
    return { label: "Very High", colorClass: "text-rose-500 bg-rose-500/10 border-rose-500/30", desc: "Avoid peak midday sun." };
  } else {
    return { label: "Extreme", colorClass: "text-purple-500 bg-purple-500/10 border-purple-500/30", desc: "Take full precautions!" };
  }
}

export function generateRuleBasedIntelligence(data: WeatherData, locationName: string): AIWeatherIntelligence {
  const cur = data.current;
  const todayDaily = data.daily;
  const maxTemp = todayDaily.temperature_2m_max[0] ?? cur.temperature_2m;
  const minTemp = todayDaily.temperature_2m_min[0] ?? cur.temperature_2m;
  const rainProb = todayDaily.precipitation_probability_max[0] ?? 0;
  const windSpeed = cur.wind_speed_10m;
  const uvMax = todayDaily.uv_index_max[0] ?? 0;

  let summary = `Expect temperatures ranging between ${Math.round(minTemp)}°C and ${Math.round(maxTemp)}°C in ${locationName}. `;
  if (rainProb > 60) {
    summary += `High likelihood of precipitation (${rainProb}%). Keep rain gear ready.`;
  } else if (rainProb > 30) {
    summary += `Slight chance of rain showers (${rainProb}%). Mostly comfortable outside.`;
  } else {
    summary += `Low chance of rain (${rainProb}%). Great weather for outdoor plans!`;
  }

  // Best outdoor window logic
  let bestOutdoorWindow = "Morning (7:00 AM - 10:00 AM) or Late Afternoon (5:00 PM - 7:30 PM)";
  if (maxTemp > 32) {
    bestOutdoorWindow = "Early Morning (6:00 AM - 8:30 AM) when temps are cooler.";
  } else if (minTemp < 5) {
    bestOutdoorWindow = "Midday (12:00 PM - 3:00 PM) during peak solar warmth.";
  } else if (rainProb > 70) {
    bestOutdoorWindow = "Check hourly forecast windows between rain bands.";
  }

  // Clothing guide
  let clothingGuide = "";
  if (maxTemp > 28) {
    clothingGuide = "Breathable cotton/linen shirt, shorts/skirt, sunglasses, sunscreen.";
  } else if (maxTemp > 18) {
    clothingGuide = "Light sweater or long sleeves with comfortable jeans.";
  } else if (maxTemp > 10) {
    clothingGuide = "Layered jacket or fleece, warm trousers, comfortable sneakers.";
  } else {
    clothingGuide = "Insulated winter coat, beanie, scarf, and warm gloves.";
  }
  if (rainProb > 40) {
    clothingGuide += " Carry a compact umbrella or rain jacket.";
  }

  // Activities
  const activities = [
    {
      activity: "Outdoor Running & Fitness",
      suitability: (rainProb < 40 && windSpeed < 25 && maxTemp < 30 ? "Excellent" : rainProb < 60 ? "Good" : "Poor") as any,
      tip: maxTemp > 28 ? "Run early before heat builds up." : rainProb > 50 ? "Consider indoor treadmills." : "Great wind and temperature conditions.",
    },
    {
      activity: "Cycling & Commuting",
      suitability: (windSpeed < 20 && rainProb < 30 ? "Excellent" : windSpeed < 35 && rainProb < 60 ? "Fair" : "Poor") as any,
      tip: windSpeed > 25 ? `Caution: Gusty winds (${Math.round(windSpeed)} km/h).` : "Smooth riding weather.",
    },
    {
      activity: "Car Wash",
      suitability: (rainProb < 20 ? "Excellent" : rainProb < 40 ? "Fair" : "Poor") as any,
      tip: rainProb > 30 ? "Rain expected soon; hold off on washing." : "Dry conditions ahead for clean shine.",
    },
    {
      activity: "Outdoor Dining & Picnic",
      suitability: (rainProb < 25 && maxTemp >= 18 && maxTemp <= 30 ? "Excellent" : "Fair") as any,
      tip: uvMax > 6 ? "Choose shaded patio seating." : "Pleasant outdoor atmosphere.",
    },
  ];

  const travelAdvisory =
    rainProb > 60
      ? "Slippery road surfaces expected during rain showers. Maintain safe driving distance."
      : windSpeed > 35
      ? "Crosswinds may affect high-profile vehicles on highway bridges."
      : "Standard clear driving and travel conditions across the region.";

  return {
    summary,
    bestOutdoorWindow,
    clothingGuide,
    activities,
    travelAdvisory,
  };
}
