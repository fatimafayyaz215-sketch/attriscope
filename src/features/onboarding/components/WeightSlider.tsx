import { ChangeEvent } from "react";

interface WeightSliderProps {
  title: string;
  description: string;
  value: number;
  onChange: (value: number) => void;
  color?: string; // hex or CSS color for the filled track + thumb
}

export default function WeightSlider({ title, description, value, onChange, color = "#2548B4" }: WeightSliderProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg p-6 hover:border-opacity-60 transition-colors shadow-sm"
      style={{ ["--slider-color" as string]: color }}
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-gray-900 font-bold text-lg">{title}</h3>
          <p className="text-gray-500 text-[10px] font-bold tracking-widest uppercase mt-1">{description}</p>
        </div>
        <div className="text-2xl font-bold" style={{ color }}>
          {value}%
        </div>
      </div>

      <div className="relative h-3 bg-gray-100 rounded-full mt-1">
        {/* Filled track */}
        <div
          className="absolute top-0 left-0 h-full rounded-full transition-all duration-150"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
        {/* Visible thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full shadow-md pointer-events-none z-10 transition-all duration-150"
          style={{ left: `calc(${value}% - 10px)`, border: `2.5px solid ${color}` }}
        />
        {/* Invisible range input overlaid for interaction */}
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
        />
      </div>
    </div>
  );
}
