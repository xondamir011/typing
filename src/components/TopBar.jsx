export default function TopBar({ time, setTime }) {
  const times = [15, 30, 60];

  return (
    <div className="flex justify-center mt-4">
      <div className="flex gap-2 sm:gap-3 bg-base-200 px-3 sm:px-4 py-2 rounded-2xl shadow-lg">

        {times.map((t) => (
          <button
            key={t}
            onClick={() => setTime(t)}
            className={`
              px-4 sm:px-6 py-2 rounded-xl font-semibold transition-all duration-200
              ${
                time === t
                  ? "bg-primary text-base-200 scale-105 shadow-md"
                  : "bg-base-100 text-gray-400 hover:bg-base-300"
              }`}>
            {t}s
          </button>
        ))}

      </div>
    </div>
  );
}