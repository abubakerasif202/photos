import React, { useState } from 'react';
import { BRAND_MATERIALS } from '../data/shotsData';
import { MaterialSample } from '../types';
import { Copy, Check, Sparkles, Layers } from 'lucide-react';

interface MaterialPaletteProps {
  onDraftPromptWithMaterial: (material: MaterialSample) => void;
}

export const MaterialPalette: React.FC<MaterialPaletteProps> = ({
  onDraftPromptWithMaterial,
}) => {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-6 border-b border-[#E3DCD0] gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#786E5E] block mb-1">
            Tactile Material Suite • Sydney Architecture
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#1A1F1B]">
            Material Palette & Tonal Harmony
          </h2>
          <p className="text-sm sm:text-base text-[#6E6455] font-sans mt-2 max-w-2xl">
            Our brand guidelines require consistent materials and lighting across all 12 outputs: warm cream walls, pale sage green accents, natural oak timber, honed stone, and brushed brass details — with an optional deep ruby-red accent in at most one image in three.
          </p>
        </div>

        <div className="bg-[#EFE9DF] p-3 rounded-lg border border-[#DDD3C1] text-xs font-mono text-[#554C3F] max-w-xs">
          <span className="font-bold text-[#1A1F1B] block mb-0.5">The 1-in-3 Ruby Rule</span>
          Restrained, deep ruby-red accent (Shot #4 whole-home-living) provides grounded focal tension without clutter.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {BRAND_MATERIALS.map((mat) => (
          <div
            key={mat.id}
            className="bg-[#FAF8F5] rounded-xl border border-[#DFD6C7] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            {/* Color Swatch Header */}
            <div
              className="h-32 sm:h-36 relative p-4 flex flex-col justify-between"
              style={{ backgroundColor: mat.hex }}
            >
              <div className="flex justify-between items-start">
                <span className="bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono uppercase px-2 py-0.5 rounded">
                  {mat.category}
                </span>
                <button
                  onClick={() => handleCopyHex(mat.hex)}
                  className="bg-white/80 hover:bg-white text-[#1A1F1B] px-2 py-0.5 rounded text-[11px] font-mono flex items-center gap-1 transition-colors shadow-2xs"
                >
                  {copiedHex === mat.hex ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>{mat.hex}</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-black/40 backdrop-blur-xs text-white p-2 rounded text-xs font-serif font-semibold">
                {mat.name}
              </div>
            </div>

            {/* Spec Details */}
            <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="text-xs">
                  <span className="font-mono text-[10px] uppercase text-[#8F8474] block">Finish Specification</span>
                  <span className="font-medium text-[#1A1F1B]">{mat.finish}</span>
                </div>

                <p className="text-xs text-[#554C3F] font-sans leading-relaxed">
                  {mat.description}
                </p>

                <div className="text-xs pt-2 border-t border-[#EAE2D5]">
                  <span className="font-mono text-[10px] uppercase text-[#8F8474] block">Brand Role</span>
                  <span className="text-[#3D362C]">{mat.role}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#EAE2D5]">
                <button
                  onClick={() => onDraftPromptWithMaterial(mat)}
                  className="w-full py-2 px-3 bg-[#EFE9DF] hover:bg-[#222823] hover:text-white text-[#222823] rounded text-xs font-mono font-medium transition-all flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>Prompt with this Material →</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
