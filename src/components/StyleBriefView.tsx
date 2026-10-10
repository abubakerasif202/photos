import React, { useState } from 'react';
import { SHARED_STYLE_BRIEF } from '../data/shotsData';
import { BrandShot } from '../types';
import { Copy, Check, Download, FileText, ArrowUpRight, Sparkles } from 'lucide-react';

interface StyleBriefViewProps {
  shots: BrandShot[];
  onOpenInStudio: (shotId: number) => void;
}

export const StyleBriefView: React.FC<StyleBriefViewProps> = ({
  shots,
  onOpenInStudio,
}) => {
  const [copiedBrief, setCopiedBrief] = useState<boolean>(false);
  const [copiedBatch, setCopiedBatch] = useState<boolean>(false);

  const handleCopyBrief = () => {
    navigator.clipboard.writeText(SHARED_STYLE_BRIEF);
    setCopiedBrief(true);
    setTimeout(() => setCopiedBrief(false), 2000);
  };

  const handleCopyAllPrompts = () => {
    const text = shots
      .map(
        (s) =>
          `#${s.id} | ${s.filename} | Ratio: ${s.aspectRatioLabel}\nPROMPT: ${s.prompt}`
      )
      .join('\n\n');
    navigator.clipboard.writeText(text);
    setCopiedBatch(true);
    setTimeout(() => setCopiedBatch(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const content = `# Australian Home Renovation Brand (Sydney, NSW)\n## Shared Architectural Style Brief\n\n${SHARED_STYLE_BRIEF}\n\n---\n\n## The 12 Editorial Prompts\n\n` +
      shots
        .map(
          (s) =>
            `### #${s.id} - ${s.filename} (${s.aspectRatioLabel})\n- **Category**: ${s.category}\n- **Prompt**: ${s.prompt}\n- **Lens**: ${s.focalLength}\n- **Lighting**: ${s.lighting}\n`
        )
        .join('\n');

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sydney-renovations-style-brief.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-[#E3DCD0] gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#786E5E] block mb-1">
            System Specification • Sydney Brand Brief
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#1A1F1B]">
            Shared Style Brief & Prompts
          </h2>
          <p className="text-sm sm:text-base text-[#6E6455] font-sans mt-2 max-w-2xl">
            The canonical instructions governing photographic realism, natural daylight balance, lens calibration, and material consistency across all 12 generations.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleCopyBrief}
            className="py-2 px-3 bg-white hover:bg-[#FAF8F5] text-[#222823] border border-[#D5CBBA] rounded text-xs font-mono font-medium flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            {copiedBrief ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Copied Brief</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#6E6455]" />
                <span>Copy Style Brief</span>
              </>
            )}
          </button>

          <button
            onClick={handleCopyAllPrompts}
            className="py-2 px-3 bg-white hover:bg-[#FAF8F5] text-[#222823] border border-[#D5CBBA] rounded text-xs font-mono font-medium flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            {copiedBatch ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Copied 12 Prompts</span>
              </>
            ) : (
              <>
                <FileText className="w-3.5 h-3.5 text-[#6E6455]" />
                <span>Copy All 12 Prompts</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadMarkdown}
            className="py-2 px-3 bg-[#222823] hover:bg-[#343D36] text-[#FAF8F5] rounded text-xs font-mono font-medium flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Export Markdown</span>
          </button>
        </div>
      </div>

      {/* Style Brief Callout Card */}
      <div className="bg-[#FAF8F5] rounded-xl border border-[#DFD6C7] p-6 sm:p-8 mb-10 shadow-xs">
        <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1A1F1B] mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#C5A059]" />
          <span>Shared Editorial Guidelines</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-sans">
          <div className="p-4 bg-[#F2ECE1] rounded-lg border border-[#E0D7C9] space-y-1">
            <span className="font-mono text-[10px] uppercase font-bold text-[#6E6455] block">
              1. Luminous Daylight
            </span>
            <p className="text-[#3D362C]">
              Bright, airy natural daylight. Soft and luminous morning or golden hour. No moody shadows or gloomy lighting.
            </p>
          </div>

          <div className="p-4 bg-[#F2ECE1] rounded-lg border border-[#E0D7C9] space-y-1">
            <span className="font-mono text-[10px] uppercase font-bold text-[#6E6455] block">
              2. Authentic Palette
            </span>
            <p className="text-[#3D362C]">
              Warm cream & off-white walls, pale sage green accents, Tasmanian oak, honed stone, brushed brass, max 1-in-3 ruby accent.
            </p>
          </div>

          <div className="p-4 bg-[#F2ECE1] rounded-lg border border-[#E0D7C9] space-y-1">
            <span className="font-mono text-[10px] uppercase font-bold text-[#6E6455] block">
              3. Architectural Lens
            </span>
            <p className="text-[#3D362C]">
              24–35mm architectural focal length with level verticals, gentle depth of field, high detail, and true-to-life color calibration.
            </p>
          </div>

          <div className="p-4 bg-[#F2ECE1] rounded-lg border border-[#E0D7C9] space-y-1">
            <span className="font-mono text-[10px] uppercase font-bold text-[#6E6455] block">
              4. Pure Exclusions
            </span>
            <p className="text-[#3D362C]">
              No people, no text, no logos, no watermarks, no signage, no clutter, no distorted geometry, no warped fixtures.
            </p>
          </div>
        </div>

        {/* Verbatim Brief */}
        <div className="mt-6 pt-6 border-t border-[#E3DCD0]">
          <span className="text-xs font-mono uppercase tracking-wider text-[#6E6455] block mb-2">
            Verbatim Style Prompt Instruction
          </span>
          <pre className="p-4 bg-[#F5EFE4] rounded-lg text-xs font-mono text-[#3D362C] whitespace-pre-wrap leading-relaxed border border-[#DFD6C7] overflow-x-auto">
            {SHARED_STYLE_BRIEF}
          </pre>
        </div>
      </div>

      {/* Prompts Table */}
      <div className="bg-[#FAF8F5] rounded-xl border border-[#DFD6C7] overflow-hidden shadow-xs">
        <div className="p-4 sm:p-6 border-b border-[#E3DCD0] flex items-center justify-between">
          <h3 className="font-serif text-lg sm:text-xl font-bold text-[#1A1F1B]">
            Batch Prompt Specification Table (12 Outputs)
          </h3>
          <span className="text-xs font-mono text-[#6E6455]">
            Model: gemini-3-pro-image-preview
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-[#EFE9DF] text-[#554C3F] font-mono uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5 w-12 text-center">#</th>
                <th className="p-3.5 w-40">Filename</th>
                <th className="p-3.5 w-32">Ratio</th>
                <th className="p-3.5">Editorial Prompt Description</th>
                <th className="p-3.5 text-right w-28">Studio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3DCD0]">
              {shots.map((shot) => (
                <tr key={shot.id} className="hover:bg-[#F5EFE4] transition-colors">
                  <td className="p-3.5 font-mono text-center font-bold text-[#6E6455]">
                    {shot.id}
                  </td>
                  <td className="p-3.5 font-mono font-bold text-[#1A1F1B] whitespace-nowrap">
                    {shot.filename}
                  </td>
                  <td className="p-3.5 font-mono text-[#6E6455] whitespace-nowrap">
                    {shot.aspectRatioLabel}
                  </td>
                  <td className="p-3.5 text-[#3D362C] leading-relaxed">
                    {shot.prompt}
                  </td>
                  <td className="p-3.5 text-right whitespace-nowrap">
                    <button
                      onClick={() => onOpenInStudio(shot.id)}
                      className="px-2.5 py-1 rounded bg-[#EFE9DF] hover:bg-[#222823] hover:text-white text-[#222823] font-mono font-medium transition-colors inline-flex items-center gap-1"
                    >
                      <span>Render</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
