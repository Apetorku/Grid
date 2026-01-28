import React from "react";

interface HeroProps {
  title: React.ReactNode;
  subtitle?: string;
  badge?: string;
  cta?: React.ReactNode;
  image?: React.ReactNode;
  gradient?: boolean;
  className?: string;
}

export function Hero({
  title,
  subtitle,
  badge,
  cta,
  image,
  gradient = true,
  className = "",
}: HeroProps) {
  return (
    <section className={`relative py-20 lg:py-32 overflow-hidden ${className}`}>
      {gradient && (
        <>
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
        </>
      )}

      <div className="relative">
        <div className="container mx-auto px-4">
          {image ? (
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                {badge && (
                  <div className="inline-block mb-4">
                    <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {badge}
                    </span>
                  </div>
                )}
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-xl text-slate-600 mb-8 max-w-2xl">
                    {subtitle}
                  </p>
                )}
                {cta}
              </div>
              <div>{image}</div>
            </div>
          ) : (
            <div className="text-center max-w-4xl mx-auto">
              {badge && (
                <div className="inline-block mb-4">
                  <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    {badge}
                  </span>
                </div>
              )}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xl text-slate-600 mb-8">{subtitle}</p>
              )}
              {cta}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
