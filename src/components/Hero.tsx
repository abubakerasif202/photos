import React from 'react';
import { Sparkles, Maximize2, ArrowUpRight, Sun, Layers, ShieldCheck } from 'lucide-react';
import { BrandShot, ImageSize } from '../types';

interface HeroProps {
  heroShot: BrandShot;
  onGenerateShot: (shot: BrandShot, size: ImageSize) => void;
  onOpenStudio: () => void;
  onOpenCompare: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  heroShot,
  onGenerateShot,
  onOpenStudio,
  onOpenCompare,
}) => {
  return (
    <section className="relative overflow-hidden bg-[#F3EFE6] border-b border-[#E3DCD0] py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Brand Editorial Statement */}
          <div className="lg:span-6 space-y-6">
            <div className="inline-flex items-center space-x-2 bg-[#E7DFD1] px-3 py-1 rounded-full text-xs font-mono text-[#574E41]">
              <Sun className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>SYDNEY NSW ARCHITECTURAL RENOVATION BRAND</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-[#1A1F1B] leading-[1.1] tracking-tight">
              Luminous daylight. <br />
              <span className="italic font-normal text-[#5A635B]">Natural Tasmanian oak.</span> <br />
              Sydney architecture.
            </h1>

            <p className="text-base sm:text-lg text-[#554E43] leading-relaxed max-w-xl font-sans">
              A curated photographic monograph & interactive AI generation studio powered by{' '}
              <strong className="text-[#1A1F1B] font-semibold">gemini-3-pro-image-preview</strong>.
              Synthesise true-to-life editorial imagery in <span className="underline decoration-[#C5A059] font-medium">1K, 2K, and 4K</span> resolutions following our rigorous Australian architectural brief.
            </p>

            {/* Quick Resolution Triggers for Hero Shot */}
            <div className="bg-[#FAF8F5] p-4 rounded-lg border border-[#E0D7C9] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-[#6E6455] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                  Shot #1: {heroShot.filename} (5:5 Ratio)
                </span>
                <span className="text-[11px] bg-[#EFE9DF] text-[#4A453C] px-2 py-0.5 rounded font-mono">
                  gemini-3-pro-image-preview
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {(['1K', '2K', '4K'] as ImageSize[]).map((size) => (
                  <button
                    key={size}
                    onClick={() => onGenerateShot(heroShot, size)}
                    className="flex-1 min-w-[90px] py-2 px-3 rounded bg-white hover:bg-[#222823] text-[#222823] hover:text-[#FAF8F5] border border-[#DDD5C7] text-xs font-mono font-medium transition-all duration-150 flex items-center justify-center space-x-1 shadow-2xs group"
                  >
                    <span>Generate</span>
                    <span className="font-bold text-[#8C764D] group-hover:text-[#FAF8F5]">{size}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onOpenStudio}
                className="bg-[#222823] hover:bg-[#343D36] text-[#FAF8F5] px-6 py-3 rounded text-sm font-semibold tracking-wide uppercase transition-all duration-200 flex items-center space-x-2 shadow-sm"
              >
                <span>Open Studio Generator</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
              <button
                onClick={onOpenCompare}
                className="bg-transparent hover:bg-[#E7DFD1] text-[#2E281F] px-5 py-3 rounded text-sm font-medium tracking-wide transition-colors border border-[#DDD5C7] flex items-center space-x-2"
              >
                <span>View 1990s vs Renovated Kitchen</span>
              </button>
            </div>

            {/* Badges */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#E3DCD0] text-xs">
              <div>
                <p className="font-serif font-bold text-lg text-[#1A1F1B]">12 Master</p>
                <p className="text-[#6E6455]">Prompts specified</p>
              </div>
              <div>
                <p className="font-serif font-bold text-lg text-[#1A1F1B]">24–35mm</p>
                <p className="text-[#6E6455]">Level verticals</p>
              </div>
              <div>
                <p className="font-serif font-bold text-lg text-[#1A1F1B]">1K / 2K / 4K</p>
                <p className="text-[#6E6455]">Master print ready</p>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Display */}
          <div className="lg:span-6">
            <div className="relative group bg-[#FAF8F5] p-3 sm:p-4 rounded-xl border border-[#DFD6C7] shadow-lg">
              <div className="relative aspect-square overflow-hidden rounded-lg bg-[#EFE9DF]">
                <img
                  src={heroShot.generatedImageUrl || heroShot.defaultImageUrl}
                  alt={heroShot.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102"
                />
                
                {/* Overlay details */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />

                <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white text-xs">
                  <span className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded font-mono tracking-wider uppercase text-[11px]">
                    #01 {heroShot.filename}
                  </span>
                  <span className="bg-[#FAF8F5]/90 text-[#1A1F1B] backdrop-blur-md px-2.5 py-1 rounded font-mono font-medium text-[11px]">
                    Ratio: {heroShot.aspectRatioLabel}
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <p className="text-xs font-mono uppercase tracking-widest text-[#E0D7C9]">
                    Exterior Facade & Native Landscaping
                  </p>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold">
                    {heroShot.title}
                  </h3>
                  <p className="text-xs text-white/80 line-clamp-2 mt-1 font-sans">
                    {heroShot.prompt}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {heroShot.paletteTags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded text-white"
                      >
                        {tag}
                      </span>
                    ))}
                    {heroShot.lastGeneratedSize && (
                      <span className="text-[10px] bg-emerald-500/80 font-mono font-bold px-2 py-0.5 rounded text-white">
                        Rendered in {heroShot.lastGeneratedSize}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Caption / Camera Info */}
              <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-[#786F62] px-1">
                <span>{heroShot.focalLength}</span>
                <span>{heroShot.lighting}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
