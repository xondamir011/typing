import { useEffect, useRef, useState } from "react";
import { getRandomWords } from "../data/words";

export default function Typing({ duration = 60 }) {
  const inputRef = useRef();

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

  // timer
  useEffect(() => {
    if (!started || finished) return;

    const timer = setInterval(() => {
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
  }, [started, finished]);

  const handleChange = (e) => {
    if (finished) return;
    if (!started) setStarted(true);
    setTyped(e.target.value);
  };

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

  const minutes = (duration - timeLeft) / 60;
  const wpm =
    minutes > 0 ? Math.round(correctChars / 5 / minutes) : 0;

  const restart = (lang = language) => {
    const newText = getRandomWords(lang, 120);
    setText(typeof newText === "string" ? newText : (newText?.join?.(" ") || ""));
    setTyped("");
    setStarted(false);
    setFinished(false);
    setTimeLeft(duration);
    setWpmHistory([]);
    setErrorHistory([]);
    inputRef.current?.focus();
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

  // FINISHED SCREEN
  if (finished) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-start pt-10 p-4">
        <h1 className="text-4xl mb-6">Test finished</h1>

        <div className="text-xl mb-4">
          WPM: {wpm} | Accuracy: {accuracy}%
        </div>

        <button onClick={() => restart()} className="btn btn-primary">
          Restart
        </button>
      </div>
    );
  }

  const cols = 20; // har qatorda nechta harf

const renderGridText = () => {
  return safeText.split("").map((char, i) => {
    const x = i % cols;
    const y = Math.floor(i / cols);

    let color = "text-base-content/40";

    if (i < typed.length) {
      color = typed[i] === char ? "text-success" : "text-error";
    }

    const isCursor = i === typed.length;

    return (
      <div
        key={i}
        className="absolute font-mono text-lg"
        style={{
          left: `${x * 14}px`,
          top: `${y * 28}px`,
        }}
      >
        <span className={color}>{char}</span>

        {isCursor && (
          <span className="absolute left-0 top-0 w-2 h-5 bg-primary animate-pulse" />
        )}
      </div>
    );
  });
};

  // MAIN SCREEN
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-start pt-10 px-3"
      onClick={() => inputRef.current?.focus()}>
    
      <div className="flex gap-5 mb-6 text-sm">
        <span>{timeLeft}s</span>
        <span>{wpm} wpm</span>
        <span>{accuracy}%</span>
      </div>

      {/* TEXT */}
      <p className="text-2xl sm:text-3xl font-mono text-center max-w-4xl leading-relaxed antialiased"
        style={{
          textShadow: "0 0 0.4px rgba(255,255,255,0.35)",
          letterSpacing: "0.3px",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        }}>
        {renderText()}
      </p>

      {/* HIDDEN INPUT */}
      <input
        ref={inputRef}
        value={typed}
        onChange={handleChange}
        className="fixed opacity-0 top-0 left-0"/>
    </div>
  );
}