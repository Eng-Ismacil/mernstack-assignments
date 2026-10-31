import React, { useState, useEffect } from "react";

const CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "SOS",
  "KES",
  "ETB",
  "GHS",
  "AED",
  "SAR",
  "TRY",
  "NGN",
  "CAD",
];

const Converter = () => {
  const [amount, setAmount] = useState("");
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("SOS");
  const [rates, setRates] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const getRates = async () => {
      try {
        setLoading(true);
        setError("");
        setRates(null);

        const res = await fetch(`https://open.er-api.com/v6/latest/${from}`);
        if (!res.ok) throw new Error("Network error");

        const data = await res.json();
        if (data.result !== "success") throw new Error("API error");

        setRates(data.rates);
      } catch (err) {
        setError("Rates lama helin. Internet-ka hubi.");
      } finally {
        setLoading(false);
      }
    };

    getRates();
    setResult(null);
  }, [from]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const value = parseFloat(amount);

    if (!value || value <= 0) {
      setResult(null);
      setError("Fadlan geli lacag sax ah.");
      return;
    }

    if (!rates || !rates[to]) {
      setResult(null);
      setError("Rate-ka currency-ga lama helin.");
      return;
    }

    const converted = value * rates[to];
    setError("");

    setResult({
      value: converted.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      rate: rates[to],
    });
  };

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
    setResult(null);
    setError("");
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header Title */}
      <div className="text-center mb-5">
        <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-[#F2FBDD] text-[#0D1117] border border-[#E7EAEE] mb-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="font-display text-2xl font-bold text-[#0D1117]">Currency Converter</h2>
        <p className="text-xs text-[#475467]">Xisaabi sarrifka lacagaha caalamka</p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl p-6 border border-[#E7EAEE] shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount Input */}
          <div>
            <label htmlFor="amount" className="block text-[11px] font-bold uppercase text-[#475467] mb-1.5 tracking-wider">
              Amount
            </label>
            <input
              id="amount"
              type="number"
              min="0"
              step="any"
              value={amount}
              placeholder="0.00"
              onChange={(e) => setAmount(e.target.value)}
              className="w-full h-11 px-3.5 bg-[#FBFBF9] rounded-xl border border-[#E7EAEE] text-base font-semibold text-[#0D1117] outline-none transition focus:bg-white focus:border-[#0D1117]"
            />
          </div>

          {/* From - Swap - To */}
          <div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-center">
            <div>
              <label htmlFor="from" className="block text-[11px] font-bold uppercase text-[#475467] mb-1.5 tracking-wider">
                From
              </label>
              <select
                id="from"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full h-10 px-2 bg-[#FBFBF9] rounded-xl border border-[#E7EAEE] text-xs font-bold text-[#0D1117] outline-none cursor-pointer focus:border-[#0D1117]"
              >
                {CURRENCIES.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-5">
              <button
                type="button"
                onClick={handleSwap}
                className="w-9 h-9 rounded-xl bg-[#F2FBDD] border border-[#E7EAEE] text-[#0D1117] hover:bg-[#B6F23A] transition flex items-center justify-center active:scale-95 font-bold"
              >
                ⇄
              </button>
            </div>

            <div>
              <label htmlFor="to" className="block text-[11px] font-bold uppercase text-[#475467] mb-1.5 tracking-wider">
                To
              </label>
              <select
                id="to"
                value={to}
                onChange={(e) => {
                  setTo(e.target.value);
                  setResult(null);
                  setError("");
                }}
                className="w-full h-10 px-2 bg-[#FBFBF9] rounded-xl border border-[#E7EAEE] text-xs font-bold text-[#0D1117] outline-none cursor-pointer focus:border-[#0D1117]"
              >
                {CURRENCIES.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* CTA Convert Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-[#0D1117] hover:bg-[#1a222e] text-[#B6F23A] font-bold rounded-xl text-sm transition disabled:opacity-50 active:scale-98 shadow-sm mt-2"
          >
            {loading ? "Cisabaynaya..." : "Convert Now"}
          </button>
        </form>

        {/* Display Result */}
        <div className="mt-5">
          <div
            className={`p-4 rounded-xl border flex flex-col items-center justify-center min-h-[90px] transition-all ${
              error
                ? "bg-rose-50 border-rose-200 text-rose-700"
                : result
                ? "bg-[#F2FBDD] border-[#B6F23A] text-[#0D1117]"
                : "bg-[#FBFBF9] border-[#E7EAEE] text-[#475467]"
            }`}
          >
            {error ? (
              <p className="text-xs font-semibold">{error}</p>
            ) : result ? (
              <div className="text-center">
                <p className="text-[10px] font-bold text-[#475467] uppercase tracking-wider mb-0.5">
                  {amount} {from} =
                </p>
                <p className="font-display text-3xl font-bold text-[#0D1117]">
                  {result.value} <span className="text-sm font-semibold text-[#475467]">{to}</span>
                </p>
                <p className="text-[11px] text-[#475467] mt-1 font-medium">
                  1 {from} = {Number(result.rate).toFixed(4)} {to}
                </p>
              </div>
            ) : (
              <p className="text-xs font-medium">Natiijada halkan ayay ku soo bixi doontaa</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Converter;