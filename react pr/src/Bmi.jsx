import React, { useState } from "react";

const Bmi = () => {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [result, setResult] = useState(null);

  const calculateBMI = (e) => {
    e.preventDefault();
    const h = parseFloat(height) / 100;
    const w = parseFloat(weight);

    if (!h || !w || h <= 0 || w <= 0) return;

    const score = parseFloat((w / (h * h)).toFixed(1));

    let category = "";
    let badgeColor = "";
    let statusDesc = "";

    if (score < 18.5) {
      category = "Underweight";
      statusDesc = "Miisaankaagu waa ka yar yahay inta laga rabay";
      badgeColor = "bg-amber-50 text-amber-900 border-amber-200";
    } else if (score >= 18.5 && score <= 24.9) {
      category = "Normal Weight";
      statusDesc = "Afisheer! Miisaankaagu waa mid aad u caafimaad badan";
      badgeColor = "bg-[#F2FBDD] text-[#0D1117] border-[#B6F23A]";
    } else if (score >= 25 && score <= 29.9) {
      category = "Overweight";
      statusDesc = "Waqti sii jimicsiga, miisaankaagu waa yara sareyaa";
      badgeColor = "bg-orange-50 text-orange-900 border-orange-200";
    } else {
      category = "Obese";
      statusDesc = "Fadlan ahmiyad sii dhimista miisaanka iyo caafimaadka";
      badgeColor = "bg-rose-50 text-rose-900 border-rose-200";
    }

    setResult({ score, category, statusDesc, badgeColor });
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header Title */}
      <div className="text-center mb-5">
        <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-[#F2FBDD] text-[#0D1117] border border-[#E7EAEE] mb-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h2 className="font-display text-2xl font-bold text-[#0D1117]">BMI Calculator</h2>
        <p className="text-xs text-[#475467]">Kala xisaab caafimaadka miisaankaaga</p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl p-6 border border-[#E7EAEE] shadow-sm">
        <form onSubmit={calculateBMI} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="height" className="block text-[11px] font-bold uppercase text-[#475467] mb-1.5 tracking-wider">
                Joogga (CM)
              </label>
              <input
                id="height"
                type="number"
                placeholder="170"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full h-11 px-3.5 bg-[#FBFBF9] rounded-xl border border-[#E7EAEE] text-sm font-semibold text-[#0D1117] outline-none transition focus:bg-white focus:border-[#0D1117]"
              />
            </div>

            <div>
              <label htmlFor="weight" className="block text-[11px] font-bold uppercase text-[#475467] mb-1.5 tracking-wider">
                Miisaanka (KG)
              </label>
              <input
                id="weight"
                type="number"
                placeholder="65"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full h-11 px-3.5 bg-[#FBFBF9] rounded-xl border border-[#E7EAEE] text-sm font-semibold text-[#0D1117] outline-none transition focus:bg-white focus:border-[#0D1117]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full h-11 bg-[#0D1117] hover:bg-[#1a222e] text-[#B6F23A] font-bold rounded-xl text-sm transition active:scale-98 shadow-sm mt-2"
          >
            Xisaabi BMI
          </button>
        </form>

        {/* Result Display */}
        <div className="mt-5">
          {result ? (
            <div className={`p-4 rounded-xl border text-center transition-all ${result.badgeColor}`}>
              <span className="text-[10px] font-extrabold tracking-widest uppercase opacity-75 block mb-1">
                BMI Score
              </span>
              <div className="font-display text-4xl font-black text-[#0D1117] my-0.5">{result.score}</div>
              <div className="text-xs font-bold uppercase tracking-wider mb-1 text-[#0D1117]">{result.category}</div>
              <p className="text-xs font-medium opacity-90">{result.statusDesc}</p>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-[#FBFBF9] border border-[#E7EAEE] text-center text-[#475467] text-xs font-medium">
              Geli jooggaaga iyo miisaankaaga si aad u xisaabiso
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Bmi;