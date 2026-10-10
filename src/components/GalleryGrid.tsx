import React, { useState } from 'react';
import {
  Sparkles,
  Maximize2,
  Download,
  Copy,
  Check,
  ArrowRight,
  SlidersHorizontal,
  Sun,
  Layers,
  Camera,
} from 'lucide-react';
import { BrandShot, ImageSize } from '../types';
import { downloadImageWithResolution, ExportFormat } from '../utils/imageExport';

interface GalleryGridProps {
  shots: BrandShot[];
  onOpenInStudio: (shotId: number) => void;
  onGenerateQuick: (shot: BrandShot, size: ImageSize) => void;
  onOpenCompare: () => void;
}

export const GalleryGrid: React.FC<GalleryGridProps> = ({
  shots,
  onOpenInStudio,
  onGenerateQuick,
  onOpenCompare,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeModalShot, setActiveModalShot] = useState<BrandShot | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const categories = [
    { id: 'all', label: 'All 12 Brand Shots' },
    { id: 'exterior', label: 'Exterior (3)' },
    { id: 'kitchen', label: 'Kitchen & Before/After (3)' },
    { id: 'bathroom', label: 'Bathroom (1)' },
    { id: 'living', label: 'Living & Alfresco (3)' },
    { id: 'details', label: 'Material Details (1)' },
    { id: 'process', label: 'Planning (1)' },
  ];

  const filteredShots =
    selectedCategory === 'all'
      ? shots
      : shots.filter((s) => s.category === selectedCategory);

  const handleCopyPrompt = (shot: BrandShot) => {
    navigator.clipboard.writeText(shot.prompt);
    setCopiedId(shot.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Title & Category Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 pb-6 border-b border-[#E3DCD0]">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#786E5E] block mb-1">
            Australian Editorial Architecture • 12 Master Prompts
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1F1B]">
            The Brand Portfolio
          </h2>
          <p className="text-sm text-[#6E6455] mt-1 font-sans max-w-xl">
            A cohesive collection engineered for consistency across daylight, natural Tasmanian oak, Navona travertine, and Sydney coastal architecture.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[#222823] text-white shadow-2xs'
                  : 'bg-[#EFE9DF] text-[#4A4235] hover:bg-[#E4DDCF]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {filteredShots.map((shot) => (
          <div
            key={shot.id}
            className="group bg-[#FAF8F5] rounded-xl border border-[#DFD6C7] overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col"
          >
            {/* Visual Image Container */}
            <div className="relative overflow-hidden bg-[#222823]">
              <div
                className={`w-full overflow-hidden ${
                  shot.aspectRatio === '1:1'
                    ? 'aspect-square'
                    : shot.aspectRatio === '3:4'
                    ? 'aspect-4/5'
                    : 'aspect-16/9'
                }`}
              >
                <img
                  src={shot.generatedImageUrl || shot.defaultImageUrl}
                  alt={shot.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                />
              </div>

              {/* Gradient Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity" />

              {/* Top Badges */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-white text-[11px] font-mono">
                <span className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded font-bold">
                  #{shot.id.toString().padStart(2, '0')} {shot.filename}
                </span>
                <span className="bg-[#FAF8F5]/90 text-[#1A1F1B] backdrop-blur-md px-2 py-0.5 rounded font-medium">
                  {shot.aspectRatioLabel}
                </span>
              </div>

              {/* Bottom Quick-actions overlay */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                <div className="flex items-center space-x-1">
                  {shot.rubyAccent && (
                    <span className="bg-[#872733] text-white px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wide">
                      Ruby Accent
                    </span>
                  )}
                  {shot.lastGeneratedSize && (
                    <span className="bg-emerald-600/90 text-white px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                      {shot.lastGeneratedSize} Render
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setActiveModalShot(shot)}
                    className="p-1.5 bg-white/20 hover:bg-white text-white hover:text-[#1A1F1B] rounded backdrop-blur-xs transition-colors"
                    title="Inspect Lightbox"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleCopyPrompt(shot)}
                    className="p-1.5 bg-white/20 hover:bg-white text-white hover:text-[#1A1F1B] rounded backdrop-blur-xs transition-colors"
                    title="Copy Prompt"
                  >
                    {copiedId === shot.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      const img = shot.generatedImageUrl || shot.defaultImageUrl;
                      downloadImageWithResolution(
                        img,
                        'png',
                        shot.lastGeneratedSize || '2K',
                        shot.aspectRatio,
                        shot.filename
                      );
                    }}
                    className="p-1.5 bg-white/20 hover:bg-white text-white hover:text-[#1A1F1B] rounded backdrop-blur-xs transition-colors"
                    title={`Download PNG (${shot.lastGeneratedSize || '2K'})`}
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Content Details */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <p className="text-[11px] font-mono uppercase text-[#786E5E] tracking-wider mb-1">
                  {shot.subtitle}
                </p>
                <h3 className="font-serif text-lg font-bold text-[#1A1F1B] group-hover:text-[#8C764D] transition-colors">
                  {shot.title}
                </h3>
                <p className="text-xs text-[#554C3F] mt-2 font-sans line-clamp-3 leading-relaxed">
                  {shot.prompt}
                </p>
              </div>

              {/* Tags */}
              <div className="pt-2 border-t border-[#E8E1D3] space-y-3">
                <div className="flex flex-wrap gap-1">
                  {shot.paletteTags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] bg-[#EFE9DF] text-[#554C3F] px-2 py-0.5 rounded font-mono"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Card Action Strip */}
                <div className="flex items-center justify-between pt-1 gap-2">
                  {shot.pairId ? (
                    <button
                      onClick={onOpenCompare}
                      className="text-xs text-[#1A1F1B] font-mono font-medium hover:underline flex items-center space-x-1"
                    >
                      <SlidersHorizontal className="w-3 h-3 text-[#C5A059]" />
                      <span>Compare Before/After</span>
                    </button>
                  ) : (
                    <div className="flex items-center space-x-1">
                      {(['1K', '2K', '4K'] as ImageSize[]).map((size) => (
                        <button
                          key={size}
                          onClick={() => onGenerateQuick(shot, size)}
                          className="px-2 py-1 rounded bg-[#EFE9DF] hover:bg-[#222823] text-[#222823] hover:text-white text-[10px] font-mono font-bold transition-all"
                          title={`Generate in ${size}`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => onOpenInStudio(shot.id)}
                    className="text-xs font-semibold uppercase tracking-wider text-[#1A1F1B] hover:text-[#8C764D] flex items-center space-x-1"
                  >
                    <span>Studio</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox / Shot Details Modal */}
      {activeModalShot && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] max-w-4xl w-full rounded-2xl overflow-hidden border border-[#DFD6C7] shadow-2xl max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-[#E3DCD0] flex items-center justify-between">
              <div>
                <span className="text-xs font-mono uppercase text-[#786E5E]">
                  Shot #{activeModalShot.id} • {activeModalShot.filename}
                </span>
                <h3 className="font-serif text-xl font-bold text-[#1A1F1B]">
                  {activeModalShot.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveModalShot(null)}
                className="text-xs font-mono uppercase bg-[#EFE9DF] hover:bg-[#E3DCD0] px-3 py-1.5 rounded text-[#222823]"
              >
                Close (ESC)
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-6">
              <div className="relative rounded-lg overflow-hidden bg-[#222823]">
                <img
                  src={activeModalShot.generatedImageUrl || activeModalShot.defaultImageUrl}
                  alt={activeModalShot.title}
                  className="w-full max-h-[480px] object-contain mx-auto"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-[#6E6455]">
                    Prompt Instruction
                  </h4>
                  <div className="p-3 bg-[#F2EDE2] rounded-md text-xs font-mono text-[#3D362C] leading-relaxed">
                    {activeModalShot.prompt}
                  </div>
                  <button
                    onClick={() => handleCopyPrompt(activeModalShot)}
                    className="py-1.5 px-3 rounded bg-white border border-[#D5CBBA] text-xs font-mono flex items-center gap-1.5 hover:bg-[#FAF8F5]"
                  >
                    <Copy className="w-3.5 h-3.5 text-[#6E6455]" />
                    <span>Copy Prompt Text</span>
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-[#6E6455]">
                    Editorial Architectural Specs
                  </h4>
                  <div className="space-y-2 border-t border-[#E3DCD0] pt-2">
                    <div className="flex justify-between py-1 border-b border-[#EBE4D8]">
                      <span className="text-[#8F8474] font-mono">Aspect Ratio</span>
                      <span className="font-medium text-[#1A1F1B]">{activeModalShot.aspectRatioLabel}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#EBE4D8]">
                      <span className="text-[#8F8474] font-mono">Focal Length</span>
                      <span className="font-medium text-[#1A1F1B]">{activeModalShot.focalLength}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#EBE4D8]">
                      <span className="text-[#8F8474] font-mono">Natural Lighting</span>
                      <span className="font-medium text-[#1A1F1B]">{activeModalShot.lighting}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#EBE4D8]">
                      <span className="text-[#8F8474] font-mono">Ruby Accent</span>
                      <span className="font-medium text-[#1A1F1B]">
                        {activeModalShot.rubyAccent ? 'Yes (Signature)' : 'No'}
                      </span>
                    </div>
                  </div>

                  {/* Download buttons */}
                  <div className="pt-3 border-t border-[#E3DCD0] space-y-1.5">
                    <span className="text-xs font-mono text-[#6E6455] block">
                      Save Image (PNG or JPG):
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          const img = activeModalShot.generatedImageUrl || activeModalShot.defaultImageUrl;
                          downloadImageWithResolution(
                            img,
                            'png',
                            activeModalShot.lastGeneratedSize || '2K',
                            activeModalShot.aspectRatio,
                            activeModalShot.filename
                          );
                        }}
                        className="py-1.5 px-2 bg-white hover:bg-[#FAF8F5] text-[#1A1F1B] border border-[#D5CBBA] rounded text-xs font-mono font-medium flex items-center justify-center gap-1 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5 text-[#C5A059]" />
                        <span>Download PNG</span>
                      </button>
                      <button
                        onClick={() => {
                          const img = activeModalShot.generatedImageUrl || activeModalShot.defaultImageUrl;
                          downloadImageWithResolution(
                            img,
                            'jpg',
                            activeModalShot.lastGeneratedSize || '2K',
                            activeModalShot.aspectRatio,
                            activeModalShot.filename
                          );
                        }}
                        className="py-1.5 px-2 bg-white hover:bg-[#FAF8F5] text-[#1A1F1B] border border-[#D5CBBA] rounded text-xs font-mono font-medium flex items-center justify-center gap-1 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5 text-[#C5A059]" />
                        <span>Download JPG</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
