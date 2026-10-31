import React, { useState } from "react";
import Converter from "./Converter";
import Bmi from "./Bmi";
import Weather from "./Weather";

function App() {
  const [activeTab, setActiveTab] = useState("weather");

  return (
    <div className="min-h-screen bg-[#FBFBF9] text-[#0D1117] flex flex-col justify-between selection:bg-[#B6F23A] selection:text-[#0D1117] font-sans">
      {/* Import Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@600;700&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
      `}</style>

      {/* Header & Navigation */}
      <header className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-[#E7EAEE]">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* Karti Brand Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0D1117] flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="#B6F23A" stroke="#B6F23A" strokeWidth="1" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <span className="font-display font-bold text-xl tracking-tight text-[#0D1117] leading-none block">
                Karti<span className="text-[#86BF11]">.</span>
              </span>
              <span className="text-[10px] text-[#475467] font-semibold uppercase tracking-wider block">Smart Tools</span>
            </div>
          </div>

          {/* Navigation Switcher */}
          <nav className="flex p-1 bg-[#F2FBDD] rounded-xl border border-[#E7EAEE] gap-1">
            <button
              onClick={() => setActiveTab("weather")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ${
                activeTab === "weather"
                  ? "bg-[#0D1117] text-[#B6F23A] shadow-sm"
                  : "text-[#475467] hover:text-[#0D1117]"
              }`}
            >
              Weather
            </button>
            <button
              onClick={() => setActiveTab("converter")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ${
                activeTab === "converter"
                  ? "bg-[#0D1117] text-[#B6F23A] shadow-sm"
                  : "text-[#475467] hover:text-[#0D1117]"
              }`}
            >
              Currency
            </button>
            <button
              onClick={() => setActiveTab("bmi")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ${
                activeTab === "bmi"
                  ? "bg-[#0D1117] text-[#B6F23A] shadow-sm"
                  : "text-[#475467] hover:text-[#0D1117]"
              }`}
            >
              BMI
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-xl w-full mx-auto px-4 py-10 flex-1 flex flex-col justify-center">
        {activeTab === "weather" && <Weather />}
        {activeTab === "converter" && <Converter />}
        {activeTab === "bmi" && <Bmi />}
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-[#475467] border-t border-[#E7EAEE] bg-white">
        <p>© {new Date().getFullYear()} <span className="font-display font-bold text-[#0D1117]">Karti</span> — Powered by Smart Tools Suite</p>
      </footer>
    </div>
  );
}

export default App;