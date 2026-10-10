import React, { useState } from 'react';
import { Compass, Sparkles, Send, Check, Calculator, ArrowRight } from 'lucide-react';
import { ImageSize } from '../types';

interface ConsultationPlannerProps {
  onDraftCustomPrompt: (prompt: string, size: ImageSize) => void;
}

export const ConsultationPlanner: React.FC<ConsultationPlannerProps> = ({
  onDraftCustomPrompt,
}) => {
  const [suburb, setSuburb] = useState<string>('Paddington');
  const [typology, setTypology] = useState<string>('Victorian Terrace Pavilion');
  const [scope, setScope] = useState<string>('Kitchen & Rear Living Pavilion');
  const [preferredTimber, setPreferredTimber] = useState<string>('Tasmanian Oak');
  const [targetSize, setTargetSize] = useState<ImageSize>('2K');
  const [submitted, setSubmitted] = useState<boolean>(false);

  const suburbs = [
    'Paddington (Heritage Conservation)',
    'Balmain (Inner West Waterfront)',
    'Mosman (Lower North Shore)',
    'Manly (Northern Beaches Coastal)',
    'Woollahra (Classic Eastern Suburbs)',
    'Annandale (Federation Heritage)',
  ];

  const typologies = [
    {
      id: 'Victorian Terrace Pavilion',
      desc: 'Glazed double-height steel & oak pavilion extending historic brickwork',
    },
    {
      id: 'Federation Bungalow Modernisation',
      desc: 'Seamless transition from tuckpointed brick to honed travertine indoor-outdoor alfresco',
    },
    {
      id: 'Sydney Harbour Coastal Residence',
      desc: 'Limewash cream render, native banksia landscaping, expansive floor-to-ceiling glass',
    },
    {
      id: 'Mid-Century Modern Revamp',
      desc: 'Low-slung roofline, Tasmanian oak batten ceilings, sage zellige accents',
    },
  ];

  const scopes = [
    'Kitchen & Rear Living Pavilion',
    'Whole-Home Interior Architecture & Ensuite Suite',
    'Second-Storey Glazed Addition & Terrace',
    'Indoor-Outdoor Bifold Entertaining Area',
  ];

  // Dynamically constructed prompt based on Sydney architectural selections
  const constructedPrompt = `Sydney ${suburb.split(' ')[0]} residential renovation: ${typology.toLowerCase()}, ${scope.toLowerCase()}, natural ${preferredTimber.toLowerCase()} joinery, honed Navona stone benchtops, warm off-white render walls, sliding glass stackers opening to native garden, soft luminous morning daylight.`;

  const handleLaunchInStudio = () => {
    onDraftCustomPrompt(constructedPrompt, targetSize);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <div className="max-w-3xl mx-auto text-center mb-10 space-y-3">
        <span className="text-xs font-mono uppercase tracking-widest text-[#786E5E] bg-[#EFE9DF] px-3 py-1 rounded-full inline-block">
          Sydney NSW Project Estimator & Concept Studio
        </span>
        <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#1A1F1B]">
          Plan Your Sydney Renovation
        </h2>
        <p className="text-sm sm:text-base text-[#6E6455] font-sans">
          Configure architectural parameters for your Sydney property to synthesize bespoke high-fidelity renders with <strong className="text-[#1A1F1B]">gemini-3-pro-image-preview</strong> in 1K, 2K, or 4K.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto items-start">
        {/* Configuration Form */}
        <div className="lg:span-7 bg-[#FAF8F5] p-6 sm:p-8 rounded-xl border border-[#DFD6C7] space-y-6 shadow-xs">
          {/* Suburb Selector */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[#6E6455] mb-2">
              Sydney Suburb / LGA Location
            </label>
            <select
              value={suburb}
              onChange={(e) => setSuburb(e.target.value)}
              className="w-full bg-white border border-[#D5CBBA] rounded-md px-3 py-2 text-sm text-[#1A1F1B] focus:ring-2 focus:ring-[#C5A059] font-medium"
            >
              {suburbs.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Typology */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[#6E6455] mb-2">
              Architectural Typology
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {typologies.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTypology(t.id)}
                  className={`p-3 rounded-lg text-left border transition-all ${
                    typology === t.id
                      ? 'bg-[#222823] text-white border-[#222823]'
                      : 'bg-white text-[#3D362C] border-[#D5CBBA] hover:bg-[#FAF8F5]'
                  }`}
                >
                  <p className="font-medium text-xs leading-snug">{t.id}</p>
                  <p className="text-[10px] opacity-75 mt-1 line-clamp-2">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Scope of Renovation */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[#6E6455] mb-2">
              Renovation Scope
            </label>
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              className="w-full bg-white border border-[#D5CBBA] rounded-md px-3 py-2 text-sm text-[#1A1F1B] focus:ring-2 focus:ring-[#C5A059]"
            >
              {scopes.map((sc) => (
                <option key={sc} value={sc}>
                  {sc}
                </option>
              ))}
            </select>
          </div>

          {/* Timber species */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[#6E6455] mb-2">
              Timber Specification
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['Tasmanian Oak', 'Spotted Gum', 'Victorian Ash'].map((tim) => (
                <button
                  key={tim}
                  type="button"
                  onClick={() => setPreferredTimber(tim)}
                  className={`py-2 px-2 text-center rounded border text-xs font-medium ${
                    preferredTimber === tim
                      ? 'bg-[#222823] text-white border-[#222823]'
                      : 'bg-white text-[#3D362C] border-[#D5CBBA]'
                  }`}
                >
                  {tim}
                </button>
              ))}
            </div>
          </div>

          {/* Resolution Affordance */}
          <div className="p-3.5 bg-[#F2EDE2] rounded-lg border border-[#DDD3C1]">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-mono uppercase tracking-wider text-[#3D362C] font-semibold">
                Target Render Resolution
              </span>
              <span className="text-xs font-mono text-[#8C764D]">{targetSize}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['1K', '2K', '4K'] as ImageSize[]).map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setTargetSize(sz)}
                  className={`py-1.5 rounded text-xs font-mono font-medium transition-colors ${
                    targetSize === sz
                      ? 'bg-[#222823] text-white'
                      : 'bg-white text-[#3D362C] border border-[#D5CBBA]'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Concept Preview & Studio Handoff */}
        <div className="lg:span-5 space-y-6">
          <div className="bg-[#FAF8F5] p-6 rounded-xl border border-[#DFD6C7] space-y-4 shadow-xs">
            <span className="text-xs font-mono uppercase tracking-wider text-[#786E5E] block">
              Synthesised Architectural Concept
            </span>
            <h3 className="font-serif text-xl font-bold text-[#1A1F1B]">
              The {suburb.split(' ')[0]} Concept Brief
            </h3>

            <div className="p-4 bg-[#F2ECE1] rounded-lg border border-[#E0D7C9] space-y-2">
              <span className="text-[10px] font-mono uppercase text-[#786E5E] block">
                Generated Studio Prompt
              </span>
              <p className="text-xs font-mono text-[#3D362C] leading-relaxed">
                "{constructedPrompt}"
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-[#EBE4D8]">
                <span className="text-[#8F8474]">Location</span>
                <span className="font-medium text-[#1A1F1B]">{suburb}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#EBE4D8]">
                <span className="text-[#8F8474]">Timber</span>
                <span className="font-medium text-[#1A1F1B]">{preferredTimber}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#EBE4D8]">
                <span className="text-[#8F8474]">Target Render</span>
                <span className="font-mono font-bold text-[#1A1F1B]">{targetSize}</span>
              </div>
            </div>

            <button
              onClick={handleLaunchInStudio}
              className="w-full bg-[#222823] hover:bg-[#343D36] text-[#FAF8F5] py-3.5 px-4 rounded-md text-xs sm:text-sm font-semibold tracking-wider uppercase transition-all flex items-center justify-center space-x-2 shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span>Launch in AI Studio ({targetSize})</span>
            </button>
          </div>

          <div className="p-4 bg-[#EFE9DF] rounded-xl border border-[#DDD3C1] text-xs text-[#554C3F] space-y-2">
            <p className="font-semibold text-[#1A1F1B]">NSW Heritage & Planning Compliance</p>
            <p className="leading-relaxed">
              Ochre & Oak designs comply with NSW State Environmental Planning Policy (SEPP) Exempt & Complying Development Codes, with specific focus on heritage conservation in Paddington, Woollahra, and Balmain.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
