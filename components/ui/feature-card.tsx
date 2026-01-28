import React from "react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
  colorClass?: string;
}

export function FeatureCard({
  icon,
  title,
  description,
  className = "",
  colorClass = "from-blue-500 to-purple-600",
}: FeatureCardProps) {
  return (
    <div
      className={`group p-8 rounded-2xl border-2 border-slate-200 bg-white hover:border-blue-500 hover:shadow-2xl transition-all duration-300 ${className}`}
    >
      <div
        className={`h-14 w-14 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
      >
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-slate-600">{description}</p>
    </div>
  );
}
