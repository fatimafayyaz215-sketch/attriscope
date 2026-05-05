import { ReactNode } from "react";

interface IndustryCardProps {
  id: string;
  title: string;
  badge: string;
  description: string;
  icon: ReactNode;
  selected: boolean;
  recommended?: boolean;
  onClick: (id: string) => void;
}

export default function IndustryCard({
  id,
  title,
  badge,
  description,
  icon,
  selected,
  recommended,
  onClick,
}: IndustryCardProps) {
  return (
    <div
      onClick={() => onClick(id)}
      className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all flex flex-col h-full ${
        selected
          ? "border-blue-700 bg-blue-50/20 shadow-sm"
          : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm"
      }`}
    >
      {recommended && (
        <div className="absolute top-4 right-4 bg-blue-700 text-white text-[10px] font-bold uppercase tracking-wider py-1 px-2.5 rounded">
          Recommended
        </div>
      )}

      <div
        className={`w-12 h-12 rounded-lg flex items-center justify-center mb-5 transition-colors ${
          selected ? "bg-blue-700 text-white" : "bg-blue-50 text-blue-600"
        }`}
      >
        {icon}
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
      <div className="text-[10px] font-bold tracking-widest text-blue-700 uppercase mb-3">
        {badge}
      </div>
      <p className="text-sm text-gray-600 leading-relaxed flex-1">
        {description}
      </p>
    </div>
  );
}
