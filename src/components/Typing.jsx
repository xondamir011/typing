import { useEffect, useRef, useState } from "react";
import { getRandomWords } from "../data/words";

export default function Typing({ duration = 60 }) {
  const inputRef = useRef();
  const wpmChartRef = useRef(null);
  const errChartRef = useRef(null);

  const [language, setLanguage] = useState("uz");

  const [text, setText] = useState(() => {
    const t = getRandomWords("uz", 120);
    return typeof t === "string" ? t : (t?.join?.(" ") || "");
  });

  const [typed, setTyped] = useState("");
  const [timeLeft, setTimeLeft] = useState(duration);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [wpmHistory, setWpmHistory] = useState([]);
  const [errorHistory, setErrorHistory] = useState([]);

  // focus
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // mobile viewport fix
  useEffect(() => {
    const fixHeight = () => {
      document.documentElement.style.setProperty(
        "--vh",
        `${window.innerHeight * 0.01}px`
      );
    };
    fixHeight();
    window.addEventListener("resize", fixHeight);
    return () => window.removeEventListener("resize", fixHeight);
  }, []);

  const safeText =
    typeof text === "string"
      ? text
      : Array.isArray(text)
        ? text.join(" ")
        : "";

  const correctChars = typed
    .split("")
    .filter((c, i) => c === safeText[i]).length;

  const accuracy =
    typed.length === 0
      ? 100
      : Math.round((correctChars / typed.length) * 100);

  const elapsed = duration - timeLeft;
  const minutes = elapsed / 60;
  const wpm = minutes > 0 ? Math.round(correctChars / 5 / minutes) : 0;
  const totalErrors = typed.length - correctChars;

  // timer
  useEffect(() => {
    if (!started || finished) return;

    const timer = setInterval(() => {
      setWpmHistory((prev) => [...prev, wpm]);
      setErrorHistory((prev) => [...prev, totalErrors]);

      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          setFinished(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [started, finished, wpm, totalErrors]);

  // draw charts after finish
  useEffect(() => {
    if (!finished) return;

    let ChartClass = null;

    const loadAndDraw = async () => {
      const mod = await import("https://esm.sh/chart.js@4.4.1/auto");
      ChartClass = mod.default;

      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const gridColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
      const tickColor = isDark ? "#888" : "#888";

      const wpmLabels = wpmHistory.map((_, i) => `${i + 1}s`);

      if (wpmChartRef.current) {
        wpmChartRef.current = new ChartClass(wpmChartRef.current, {
          type: "line",
          data: {
            labels: wpmLabels,
            datasets: [
              {
                label: "WPM",
                data: wpmHistory,
                borderColor: "#378ADD",
                backgroundColor: "rgba(55,138,221,0.10)",
                borderWidth: 2,
                pointRadius: 0,
                fill: true,
                tension: 0.4,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: {
                ticks: { color: tickColor, font: { size: 11 }, maxTicksLimit: 8 },
                grid: { color: gridColor },
              },
              y: {
                beginAtZero: true,
                ticks: { color: tickColor, font: { size: 11 } },
                grid: { color: gridColor },
              },
            },
          },
        });
      }

      // errors per 5s bucket
      const bucketSize = 5;
      const errBuckets = [];
      const errLabels = [];
      for (let i = 0; i < errorHistory.length; i += bucketSize) {
        const slice = errorHistory.slice(i, i + bucketSize);
        const start = slice[0] ?? 0;
        const end = slice[slice.length - 1] ?? 0;
        errBuckets.push(Math.max(0, end - start));
        errLabels.push(`${i}s`);
      }

      if (errChartRef.current) {
        errChartRef.current = new ChartClass(errChartRef.current, {
          type: "bar",
          data: {
            labels: errLabels,
            datasets: [
              {
                label: "Xatolar",
                data: errBuckets,
                backgroundColor: "rgba(226,75,74,0.55)",
                borderColor: "#E24B4A",
                borderWidth: 1,
                borderRadius: 3,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: {
                ticks: { color: tickColor, font: { size: 11 } },
                grid: { color: gridColor },
              },
              y: {
                beginAtZero: true,
                ticks: { color: tickColor, font: { size: 11 }, precision: 0 },
                grid: { color: gridColor },
              },
            },
          },
        });
      }
    };

    loadAndDraw();

    return () => {
      if (wpmChartRef.current?.destroy) wpmChartRef.current.destroy();
      if (errChartRef.current?.destroy) errChartRef.current.destroy();
    };
  }, [finished]);

  const handleChange = (e) => {
    if (finished) return;
    if (!started) setStarted(true);
    setTyped(e.target.value);
  };

  const restart = (lang = language) => {
    const newText = getRandomWords(lang, 120);
    setText(typeof newText === "string" ? newText : (newText?.join?.(" ") || ""));
    setTyped("");
    setStarted(false);
    setFinished(false);
    setTimeLeft(duration);
    setWpmHistory([]);
    setErrorHistory([]);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const renderText = () =>
    safeText.split("").map((char, i) => {
      let color = "text-base-content/40";
      if (i < typed.length) {
        color = typed[i] === char ? "text-success" : "text-error";
      }
      const isCursor = i === typed.length;
      return (
        <span key={i} className="relative">
          <span className={color}>{char}</span>
          {isCursor && (
            <span className="absolute left-0 top-1 w-2 h-7 bg-primary animate-pulse" />
          )}
        </span>
      );
    });

  if (finished) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-start pt-10 p-4">
        <h1 className="text-3xl font-medium mb-6">Natija</h1>

        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-3 w-full max-w-2xl mb-6">
          {[
            { label: "WPM", value: wpm, extra: "text-blue-400" },
            { label: "Aniqlik", value: `${accuracy}%`, extra: "text-green-400" },
            { label: "Xatolar", value: totalErrors, extra: "text-red-400" },
            { label: "Vaqt", value: `${duration}s`, extra: "" },
          ].map(({ label, value, extra }) => (
            <div key={label} className="bg-base-200 rounded-xl p-4 text-center">
              <p className="text-xs text-base-content/50 mb-1">{label}</p>
              <p className={`text-2xl font-medium ${extra}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl mb-6">
          <div className="bg-base-100 border border-base-300 rounded-xl p-4">
            <p className="text-xs text-base-content/50 mb-3">WPM (vaqt bo'yicha)</p>
            <div className="relative" style={{ height: "180px" }}>
              <canvas ref={wpmChartRef}></canvas>
            </div>
          </div>

          <div className="bg-base-100 border border-base-300 rounded-xl p-4">
            <p className="text-xs text-base-content/50 mb-3">Xatolar (har 5 soniyada)</p>
            <div className="relative" style={{ height: "180px" }}>
              <canvas ref={errChartRef}></canvas>
            </div>
          </div>
        </div>

        <button onClick={() => restart()} className="btn btn-primary">
          Qayta boshlash
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-start pt-10 px-3"
      onClick={() => inputRef.current?.focus()}>

      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 mb-6 sm:text-sm">
        <span>{timeLeft}s</span>
        <span>{wpm} wpm</span>
        <span className="whitespace-nowrap px-1">{accuracy}%</span>
      </div>

      {/* TEXT */}
      <p
        className="text-2xl sm:text-3xl font-mono text-center max-w-4xl leading-relaxed antialiased"
        style={{
          textShadow: "0 0 0.4px rgba(255,255,255,0.35)",
          letterSpacing: "0.3px",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        }}
      >
        {renderText()}
      </p>

      {/* HIDDEN INPUT */}
      <input
        ref={inputRef}
        value={typed}
        onChange={handleChange}
        className="fixed opacity-0 top-0 left-0"
      />
    </div>
  );
}