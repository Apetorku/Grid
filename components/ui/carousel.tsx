"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";

interface CarouselProps {
  children: React.ReactNode;
  autoplay?: boolean;
  interval?: number;
  className?: string;
}

export function Carousel({
  children,
  autoplay = true,
  interval = 5000,
  className = "",
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Convert children to array to handle properly
  const childrenArray = React.Children.toArray(children);
  const childCount = childrenArray.length;

  useEffect(() => {
    if (!autoplay || childCount === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % childCount);
    }, interval);

    return () => clearInterval(timer);
  }, [autoplay, interval, childCount]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + childCount) % childCount);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % childCount);
  };

  if (childCount === 0) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {childrenArray.map((child, index) => (
            <div key={index} className="min-w-full">
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      {childCount > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 hover:bg-white shadow-lg"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 hover:bg-white shadow-lg"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {childrenArray.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? "w-8 bg-blue-600"
                    : "w-2 bg-white/60 hover:bg-white"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
