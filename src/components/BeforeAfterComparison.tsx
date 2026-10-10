import React, { useState, useRef } from 'react';
import { SlidersHorizontal, Sparkles, ArrowLeftRight, CheckCircle2, RefreshCw } from 'lucide-react';
import { BrandShot, ImageSize } from '../types';

interface BeforeAfterComparisonProps {
  beforeShot: BrandShot;
  afterShot: BrandShot;
  onOpenInStudio: (shotId: number) => void;
  onGenerateShot: (shot: BrandShot, size: ImageSize) => void;
}

export const BeforeAfterComparison: React.FC<BeforeAfterComparisonProps> = ({
  beforeShot,
  afterShot,
  onOpenInStudio,
  onGenerateShot,
}) => {
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percent);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = Math.max(0, Math.min(touch.clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percent);
  };

  const beforeImage = beforeShot.generatedImageUrl || beforeShot.defaultImageUrl;
  const afterImage = afterShot.generatedImageUrl || afterShot.defaultImageUrl;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
        <span className="text-xs font-mono uppercase tracking-widest text-[#786E5E] bg-[#EFE9DF] px-3 py-1 rounded-full inline-block">
          Exact Camera Alignment • Fixed Tripod Position A
        </span>
        <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#1A1F1B]">
          Before & After Transformation
        </h2>
        <p className="text-sm sm:text-base text-[#6E6455] font-sans">
          Shot #6 vs Shot #7. Rigorously preserved camera vantage and window orientation demonstrating how Sydney daylight, Tasmanian oak joinery, and honed stone redefine an outdated 1990s kitchen.
        </p>
      </div>

      {/* Interactive Slider Widget */}
      <div className="bg-[#FAF8F5] p-4 sm:p-6 rounded-2xl border border-[#DFD6C7] shadow-lg max-w-5xl mx-auto">
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
          className="relative aspect-16/9 overflow-hidden rounded-xl bg-[#222823] cursor-ew-resize select-none"
        >
          {/* After Image (Background layer) */}
          <img
            src={afterImage}
            alt={afterShot.title}
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Before Image (Clipped layer) */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ width: `${sliderPosition}%` }}
          >
            <img
              src={beforeImage}
              alt={beforeShot.title}
              className="absolute inset-0 w-full h-full object-cover max-w-none"
              style={{
                width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%',
                height: '100%',
              }}
            />
          </div>

          {/* Divider Handle */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl cursor-ew-resize"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-[#222823] text-white flex items-center justify-center border-2 border-white shadow-lg">
              <ArrowLeftRight className="w-4 h-4 text-[#D4AF37]" />
            </div>
          </div>

          {/* Floating Pill Labels */}
          <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md text-white px-3 py-1 rounded text-xs font-mono">
            <span>BEFORE: 1990s Kitchen (#06)</span>
          </div>

          <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md text-white px-3 py-1 rounded text-xs font-mono">
            <span>AFTER: Contemporary Suite (#07)</span>
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-[11px] font-mono pointer-events-none">
            Drag or hover across frame to compare
          </div>
        </div>

        {/* Side-by-side prompt & specifications */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 pt-6 border-t border-[#E3DCD0]">
          {/* Before Card */}
          <div className="bg-[#F2ECE1] p-4 rounded-xl border border-[#DFD6C7] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase font-bold text-[#6E6455]">
                Shot #06: compare-before
              </span>
              <span className="text-[11px] font-mono text-[#8F8474]">16:9 Landscape</span>
            </div>
            <h3 className="font-serif text-lg font-bold text-[#1A1F1B]">
              Outdated 1990s Closed-Off Kitchen
            </h3>
            <p className="text-xs font-mono bg-white/70 p-3 rounded text-[#4A4235] leading-relaxed">
              "{beforeShot.prompt}"
            </p>
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => onOpenInStudio(beforeShot.id)}
                className="text-xs font-mono font-medium text-[#1A1F1B] hover:underline"
              >
                Open in AI Studio →
              </button>
              <div className="flex gap-1.5">
                {(['1K', '2K', '4K'] as ImageSize[]).map((size) => (
                  <button
                    key={size}
                    onClick={() => onGenerateShot(beforeShot, size)}
                    className="px-2 py-1 bg-white hover:bg-[#222823] hover:text-white rounded border border-[#D5CBBA] text-[10px] font-mono font-bold"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* After Card */}
          <div className="bg-[#F2ECE1] p-4 rounded-xl border border-[#DFD6C7] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase font-bold text-[#1A1F1B] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                Shot #07: compare-after
              </span>
              <span className="text-[11px] font-mono text-[#8F8474]">16:9 Landscape</span>
            </div>
            <h3 className="font-serif text-lg font-bold text-[#1A1F1B]">
              Reimagined Culinary Pavilion
            </h3>
            <p className="text-xs font-mono bg-white/70 p-3 rounded text-[#4A4235] leading-relaxed">
              "{afterShot.prompt}"
            </p>
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => onOpenInStudio(afterShot.id)}
                className="text-xs font-mono font-medium text-[#1A1F1B] hover:underline"
              >
                Open in AI Studio →
              </button>
              <div className="flex gap-1.5">
                {(['1K', '2K', '4K'] as ImageSize[]).map((size) => (
                  <button
                    key={size}
                    onClick={() => onGenerateShot(afterShot, size)}
                    className="px-2 py-1 bg-[#222823] text-white hover:bg-[#343D36] rounded text-[10px] font-mono font-bold"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Transformation Breakdown */}
        <div className="mt-6 pt-6 border-t border-[#E3DCD0]">
          <h4 className="text-xs font-mono uppercase tracking-wider text-[#6E6455] mb-3">
            Architectural Intervention Analysis
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {[
              {
                feature: 'Cabinetry',
                before: 'Yellowed 1990s laminate',
                after: 'Warm cream polyurethane & Tasmanian oak',
              },
              {
                feature: 'Benchtops',
                before: 'Tired beige tiles & grout',
                after: 'Honed Navona travertine slab',
              },
              {
                feature: 'Lighting',
                before: 'Fluorescent ceiling box fixture',
                after: 'Diffused daylight & brass pendants',
              },
              {
                feature: 'Floorplan',
                before: 'Closed U-shape with partition wall',
                after: 'Open-concept culinary island pavilion',
              },
            ].map((item) => (
              <div key={item.feature} className="p-3 bg-white rounded-lg border border-[#E0D7C9]">
                <p className="font-mono text-[11px] font-bold text-[#1A1F1B] uppercase mb-1">
                  {item.feature}
                </p>
                <p className="text-[11px] text-rose-700 line-through mb-0.5">
                  {item.before}
                </p>
                <p className="text-[11px] text-emerald-800 font-medium">
                  {item.after}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
