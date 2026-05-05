import { ChangeEvent } from "react";

interface WeightSliderProps {
  title: string;
  description: string;
  value: number;
  onChange: (value: number) => void;
}

export default function WeightSlider({ title, description, value, onChange }: WeightSliderProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-gray-900 font-bold text-lg">{title}</h3>
          <p className="text-gray-500 text-[10px] font-bold tracking-widest uppercase mt-1">{description}</p>
        </div>
        <div className="text-2xl font-bold text-blue-900">
          {value}%
        </div>
      </div>
      
      <div className="relative h-2.5 bg-gray-100 rounded-full">
        <div 
          className="absolute top-0 left-0 h-full bg-blue-100 rounded-full"
          style={{ width: '100%' }}
        />
        <div 
          className="absolute top-0 left-0 h-full bg-blue-600 rounded-full transition-all duration-300"
          style={{ width: `${value}%` }}
        />
        {/* We use an invisible range input overlaid on top to capture clicks/drags */}
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={value} 
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
}
