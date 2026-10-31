import React, { useState } from "react";

const Weather = () => {
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

  const fetchWeather = async (e) => {
    e.preventDefault();
    const trimmedCity = city.trim();
    if (!trimmedCity) return;

    if (!API_KEY) {
      setError(
        "OpenWeatherMap API key is missing. Add VITE_OPENWEATHER_API_KEY to your .env file."
      );
      return;
    }

    setLoading(true);
    setError("");
    setWeatherData(null);
    setForecastData(null);

    try {
      const currentWeatherRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
          trimmedCity
        )}&units=metric&appid=${API_KEY}`
      );

      if (!currentWeatherRes.ok) {
        const errorBody = await currentWeatherRes.json().catch(() => ({}));
        const apiMessage = errorBody.message || "Weather request failed.";

        if (currentWeatherRes.status === 401) {
          throw new Error(
            "OpenWeatherMap API key is invalid or expired. Please add a valid key from openweathermap.org."
          );
        }

        throw new Error(apiMessage);
      }

      const currentData = await currentWeatherRes.json();
      setWeatherData(currentData);

      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
          trimmedCity
        )}&units=metric&appid=${API_KEY}`
      );

      if (!forecastRes.ok) {
        const errorBody = await forecastRes.json().catch(() => ({}));
        const apiMessage = errorBody.message || "Forecast request failed.";
        throw new Error(apiMessage);
      }

      const forecastJson = await forecastRes.json();
      const dailyList = forecastJson.list.filter((item) =>
        item.dt_txt.includes("12:00:00")
      );
      setForecastData(dailyList);
    } catch (err) {
      setError(
        err.message || "City not found! Please check the city name and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header Title */}
      <div className="text-center mb-5">
        <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-[#F2FBDD] text-[#0D1117] border border-[#E7EAEE] mb-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h10a4 4 0 004-4M7 10l5-5 5 5M12 15V3" />
          </svg>
        </div>
        <h2 className="font-display text-2xl font-bold text-[#0D1117]">Weather Forecast</h2>
        <p className="text-xs text-[#475467]">Ka eeg xaaladda cimilada magaalooyinka adduunka</p>
      </div>

      {/* Main Search Box */}
      <div className="bg-white rounded-2xl p-6 border border-[#E7EAEE] shadow-sm mb-6">
        <form onSubmit={fetchWeather} className="flex gap-2">
          <input
            type="text"
            placeholder="Geli magaalada (tusaale: Mogadishu, London)..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full h-11 px-3.5 bg-[#FBFBF9] rounded-xl border border-[#E7EAEE] text-sm font-semibold text-[#0D1117] outline-none transition focus:bg-white focus:border-[#0D1117]"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-5 h-11 bg-[#0D1117] hover:bg-[#1a222e] text-[#B6F23A] font-bold rounded-xl text-sm transition disabled:opacity-50 active:scale-98 shadow-sm shrink-0"
          >
            {loading ? "Raadinaya..." : "Search"}
          </button>
        </form>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-2xl p-8 border border-[#E7EAEE] text-center mb-6 flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#E7EAEE] border-t-[#0D1117] rounded-full animate-spin mb-3"></div>
          <p className="text-xs font-semibold text-[#475467]">Loading weather data...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-rose-800 text-center text-xs font-semibold mb-6 flex items-center justify-center gap-2">
          <span className="text-base">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Current Weather Card */}
      {weatherData && !loading && (
        <div className="bg-[#0D1117] text-white rounded-2xl p-6 border border-[#E7EAEE] shadow-sm mb-6 relative overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-display text-2xl font-bold text-white flex items-center gap-2">
                {weatherData.name}
                <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-[#1a222e] text-[#B6F23A] border border-[#B6F23A]/30">
                  {weatherData.sys.country}
                </span>
              </h3>
              <p className="text-xs text-[#98A2B3] mt-0.5">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="text-right">
              <img
                src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
                alt="weather icon"
                className="w-16 h-16 -mr-2 -mt-2"
              />
              <span className="text-xs capitalize font-medium text-[#B6F23A] block -mt-2">
                {weatherData.weather[0].description}
              </span>
            </div>
          </div>

          <div className="flex items-baseline mb-6">
            <span className="font-display text-5xl font-black text-white">
              {Math.round(weatherData.main.temp)}°C
            </span>
          </div>

          {/* Bottom Details Grid */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/10">
            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
              <span className="text-[10px] text-[#98A2B3] uppercase font-bold tracking-wider block mb-0.5">Feels Like</span>
              <span className="text-sm font-bold text-white">{Math.round(weatherData.main.feels_like)}°C</span>
            </div>
            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
              <span className="text-[10px] text-[#98A2B3] uppercase font-bold tracking-wider block mb-0.5">Humidity</span>
              <span className="text-sm font-bold text-white">{weatherData.main.humidity}%</span>
            </div>
            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
              <span className="text-[10px] text-[#98A2B3] uppercase font-bold tracking-wider block mb-0.5">Wind</span>
              <span className="text-sm font-bold text-white">{weatherData.wind.speed} m/s</span>
            </div>
          </div>
        </div>
      )}

      {/* 5 Days Forecast */}
      {forecastData && !loading && (
        <div className="bg-white rounded-2xl p-6 border border-[#E7EAEE] shadow-sm">
          <h4 className="font-display font-bold text-sm text-[#0D1117] mb-4 flex items-center gap-2">
            <span>📅</span> 5 Days Weather Forecast
          </h4>
          <div className="grid grid-cols-5 gap-2">
            {forecastData.map((item, index) => {
              const date = new Date(item.dt * 1000);
              return (
                <div
                  key={index}
                  className="bg-[#FBFBF9] p-2.5 rounded-xl border border-[#E7EAEE] text-center flex flex-col items-center justify-between"
                >
                  <span className="text-[10px] font-bold text-[#475467] block">
                    {date.toLocaleDateString("en-US", { weekday: "short" })}
                  </span>
                  <span className="text-[9px] text-[#475467] mb-1">
                    {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                  <img
                    src={`https://openweathermap.org/img/wn/${item.weather[0].icon}.png`}
                    alt="icon"
                    className="w-10 h-10 my-0.5"
                  />
                  <span className="text-xs font-bold text-[#0D1117] mt-1">
                    {Math.round(item.main.temp)}°C
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Weather;