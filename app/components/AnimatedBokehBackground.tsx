import React from "react"

const bokehColors = [
  "bg-pink-400/30",
  "bg-blue-400/30",
  "bg-purple-400/20",
  "bg-white/20",
  "bg-cyan-300/20",
  "bg-yellow-200/20",
  "bg-green-300/20",
]

const bokehConfig = [
  { size: "w-40 h-40", top: "top-1/4", left: "left-1/3", delay: "delay-0" },
  { size: "w-32 h-32", top: "top-2/3", left: "left-2/3", delay: "delay-300" },
  { size: "w-24 h-24", top: "top-1/2", left: "left-1/5", delay: "delay-500" },
  { size: "w-28 h-28", top: "top-1/5", left: "left-3/4", delay: "delay-700" },
  { size: "w-20 h-20", top: "top-3/4", left: "left-1/4", delay: "delay-1000" },
  { size: "w-36 h-36", top: "top-1/3", left: "left-2/5", delay: "delay-1200" },
  { size: "w-16 h-16", top: "top-2/5", left: "left-4/5", delay: "delay-1500" },
  { size: "w-24 h-24", top: "top-3/5", left: "left-1/2", delay: "delay-1800" },
]

const AnimatedBokehBackground: React.FC = () => (
  <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
    {bokehConfig.map((cfg, i) => (
      <div
        key={i}
        className={`absolute ${cfg.top} ${cfg.left} ${cfg.size} rounded-full blur-3xl ${bokehColors[i % bokehColors.length]} animate-bokeh-move ${cfg.delay}`}
        aria-hidden="true"
      />
    ))}
    <style jsx global>{`
      @keyframes bokeh-move {
        0%, 100% { transform: translateY(0) scale(1); opacity: 1; }
        50% { transform: translateY(-40px) scale(1.15); opacity: 0.85; }
      }
      .animate-bokeh-move {
        animation: bokeh-move 10s ease-in-out infinite;
      }
      .delay-0 { animation-delay: 0s; }
      .delay-300 { animation-delay: 0.3s; }
      .delay-500 { animation-delay: 0.5s; }
      .delay-700 { animation-delay: 0.7s; }
      .delay-1000 { animation-delay: 1s; }
      .delay-1200 { animation-delay: 1.2s; }
      .delay-1500 { animation-delay: 1.5s; }
      .delay-1800 { animation-delay: 1.8s; }
    `}</style>
  </div>
)

export default AnimatedBokehBackground; 