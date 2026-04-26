// import { useState } from "react";
// import TopBar from "./components/TopBar";
// import Typing from "./components/Typing";
// import { getRandomWords } from "./data/words";

// export default function App() {
//   const [time, setTime] = useState(15);
//   const [language, setLanguage] = useState("uz");
//   const wordsForTyping = getRandomWords(language, 50);

//   return (
//     <ThemeProvider>
//   <div className="min-h-screen flex flex-col items-center pt-6 px-3 sm:px-6">

//     {/* 🔝 TOP SECTION */}
//     <div className="w-full max-w-5xl flex flex-col sm:flex-row items-center justify-around gap-3">

//       {/* ⏱ TopBar */}
//       <TopBar
//         time={time}
//         setTime={setTime}
//         language={language}
//         setLanguage={setLanguage}/>

//       <div className="dropdown">
//         <div tabIndex={0} role="button" className="btn btn-sm sm:btn-md">
//           Theme
//           <svg
//             width="12px"
//             height="12px"
//             className="ml-1 inline-block h-2 w-2 fill-current opacity-60"
//             xmlns="http://www.w3.org/2000/svg"
//             viewBox="0 0 2048 2048"
//           >
//             <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"></path>
//           </svg>
//         </div>

//         <ul tabIndex={0}
//           className="dropdown-content bg-base-300 rounded-box z-50 w-44 p-2 shadow-2xl">
//           {["default", "retro", "synthwave", "valentine", "aqua"].map((t) => (
//             <li key={t}>
//               <input
//                 type="radio"
//                 name="theme-dropdown"
//                 className="theme-controller w-full btn btn-sm btn-ghost justify-start"
//                 aria-label={t}
//                 value={t}
//               />
//             </li>
//           ))}
//         </ul>
//       </div>
//     </div>

//     <div className="w-full max-w-5xl mt-6">
//       <Typing words={wordsForTyping} duration={time} />
//     </div>

//   </div>
// </ThemeProvider>
//   );
// }

import React from 'react'

const App = () => {
  return (
    <div>App</div>
  )
}

export default App