import { useEffect, useRef, useState } from "react";
import { getRandomWords } from "../data/words";


export default function Typing({ duration = 60 }) {
  const inputRef = useRef();

  const [language, setLanguage] = useState("uz");
  const [text, setText] = useState(getRandomWords("uz", 120));
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

  // history (WPM + ERROR)
  useEffect(() => {
    if (!started || finished) return;

    const interval = setInterval(() => {
      const correct = typed
        .split("")
        .filter((c, i) => c === text[i]).length;

      const errors = typed.length - correct;

      const minutes = (duration - timeLeft) / 60;
      const wpm = minutes > 0 ? Math.round(correct / 5 / minutes) : 0;

      setWpmHistory((p) => [...p, wpm]);
      setErrorHistory((p) => [...p, errors]);
    }, 1000);

    return () => clearInterval(interval);
  }, [typed, timeLeft, started, finished]);

  const handleChange = (e) => {
    if (finished) return;
    if (!started) setStarted(true);
    setTyped(e.target.value);
  };

  const correctChars = typed
    .split("")
    .filter((c, i) => c === text[i]).length;

  const accuracy =
    typed.length === 0
      ? 100
      : Math.round((correctChars / typed.length) * 100);

  const minutes = (duration - timeLeft) / 60;
  const wpm =
    minutes > 0 ? Math.round(correctChars / 5 / minutes) : 0;

  const restart = (lang = language) => {
    setText(getRandomWords(lang, 120));
    setTyped("");
    setStarted(false);
    setFinished(false);
    setTimeLeft(duration);
    setWpmHistory([]);
    setErrorHistory([]);
    inputRef.current?.focus();
  };

  const changeLanguage = (lang) => {
    setLanguage(lang);
    restart(lang);
  };

  if (finished) {
    const data = wpmHistory.map((w, i) => ({
      time: i + 1,
      wpm: w,
      errors: errorHistory[i],
    }));

    return (
      <div className="min-h-screen text-base-content p-3 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">

          {/* LEFT */}
          <div className="flex flex-row md:flex-col gap-6 md:justify-start">
            <div>
              <p className="text-gray-400">wpm</p>
              <h1 className="text-4xl sm:text-6xl">{wpm}</h1>
            </div>

            <div>
              <p className="text-gray-400">acc</p>
              <h1 className="text-4xl sm:text-6xl">{accuracy}%</h1>
            </div>

            <div className="text-gray-400 text-sm">
              <p>test type</p>
              <p>time {duration}</p>
              <p>{language}</p>
            </div>
          </div>

          {/* GRAPH */}
          <div className="col-span-4 md:col-span-4 w-full">
            <svg width="100%" height="300" className="bg-[#1f1f1f] w-full h-[200px] sm:h-[300px] rounded-xl p-3 sm:p-4">

              {/* WPM LINE */}
              <polyline
                fill="none"
                stroke="#facc15"
                strokeWidth="3"
                points={data.map((d, i) => {
                  const x = (i / (data.length - 1 || 1)) * 1000;
                  const y = 280 - Math.min(d.wpm * 3, 260);
                  return `${x},${y}`;
                }).join(" ")} />

              {/* ERROR DOT */}
              {data.map((d, i) => {
                const x = (i / (data.length - 1 || 1)) * 1000;
                const y = 280 - Math.min(d.errors * 20, 260);
                return <circle key={i} cx={x} cy={y} r="3" fill="red" />;
              })}
            </svg>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="flex flex-wrap justify-around gap-6 mt-10 text-gray-400 text-center">

          <div>
            <p>raw</p>
            <h2 className="text-xl sm:text-2xl">{wpm + 10}</h2>
          </div>

          <div>
            <p className="text-sm">characters</p>
            <h2 className="text-xl sm:text-2xl">
              {typed.length}/{typed.length - correctChars}/0/0
            </h2>
          </div>

          <div>
            <p className="text-sm">consistency</p>
            <h2 className="text-xl sm:text-2xl">
              {Math.max(50, accuracy - 10)}%
            </h2>
          </div>

          <div>
            <p className="text-sm">time</p>
            <h2 className="text-xl sm:text-2xl">{duration}s</h2>
          </div>
        </div>

        <div className="flex justify-center mt-10">
          <button onClick={() => restart()} className="btn btn-primary px-6 sm:px-8">
            Restart
          </button>
        </div>
      </div>
    );
  }

  // 🔤 TYPING SCREEN
  const renderText = () =>
    text.split("").map((char, i) => {
      let color = "text-base-content/40";

      if (i < typed.length) {
        color =
          typed[i] === char
            ? "text-success"
            : "text-error";
      }

      const isCursor = i === typed.length;

      return (
        <span key={i} className="relative">
          <span className={color}>{char}</span>
          {isCursor && (
            <span className="absolute left-0 top-1 w-2 h-7 bg-primary animate-pulse"/>
          )}
        </span>
      );
    });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center"
      onClick={() => inputRef.current.focus()}>

      <div className="flex gap-5 mb-6">
        <span>{timeLeft}s</span>
        <span>{wpm} wpm</span>
        <span>{accuracy}%</span>
      </div>

      <p className="text-3xl font-mono text-center max-w-4xl">
        {renderText()}
      </p>

      <input
        ref={inputRef}
        value={typed}
        onChange={handleChange}
        className="opacity-0 absolute"
      />
    </div>
  );
}