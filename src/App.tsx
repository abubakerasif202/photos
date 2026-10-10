import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ImageGenerator } from './components/ImageGenerator';
import { GalleryGrid } from './components/GalleryGrid';
import { BeforeAfterComparison } from './components/BeforeAfterComparison';
import { MaterialPalette } from './components/MaterialPalette';
import { StyleBriefView } from './components/StyleBriefView';
import { ConsultationPlanner } from './components/ConsultationPlanner';
import { INITIAL_BRAND_SHOTS, SHARED_STYLE_BRIEF } from './data/shotsData';
import { BrandShot, ImageSize, GenerationHistoryItem, MaterialSample } from './types';
import { Sparkles, Sun, CheckCircle, AlertCircle, Camera } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('gallery');
  const [shots, setShots] = useState<BrandShot[]>(INITIAL_BRAND_SHOTS);
  const [selectedShotId, setSelectedShotId] = useState<number>(1);
  const [history, setHistory] = useState<GenerationHistoryItem[]>([]);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Update shot with newly generated image
  const handleUpdateShotImage = (id: number, imageUrl: string, size: ImageSize) => {
    setShots((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              generatedImageUrl: imageUrl,
              lastGeneratedSize: size,
              generatedAt: new Date().toLocaleTimeString(),
            }
          : s
      )
    );
    showToast(`Shot #${id} updated successfully at ${size} resolution!`, 'success');
  };

  const handleAddToHistory = (item: GenerationHistoryItem) => {
    setHistory((prev) => [item, ...prev]);
  };

  const handleClearHistory = () => {
    setHistory([]);
    showToast('Generation history cleared.', 'info');
  };

  // One-click quick generate from Hero or Gallery cards
  const handleGenerateShot = async (shot: BrandShot, size: ImageSize) => {
    setSelectedShotId(shot.id);
    setActiveTab('studio');
    showToast(`Loaded Shot #${shot.id} (${shot.filename}) into Studio at ${size} resolution.`, 'info');
  };

  const handleOpenInStudio = (shotId: number) => {
    setSelectedShotId(shotId);
    setActiveTab('studio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDraftWithMaterial = (mat: MaterialSample) => {
    setSelectedShotId(8); // #8 inspo-materials
    setActiveTab('studio');
    showToast(`Selected material: ${mat.name} for Studio drafting.`, 'info');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDraftCustomPrompt = (customPrompt: string, size: ImageSize) => {
    setSelectedShotId(1);
    setActiveTab('studio');
    showToast(`Drafted custom Sydney concept at ${size}. Ready to render!`, 'info');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const heroShot = shots.find((s) => s.id === 1) || shots[0];
  const beforeShot = shots.find((s) => s.id === 6) || shots[5];
  const afterShot = shots.find((s) => s.id === 7) || shots[6];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1F2421]">
      {/* Toast notification banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce duration-300">
          <div
            className={`px-4 py-3 rounded-lg shadow-xl text-xs font-mono flex items-center space-x-2 border ${
              toastMessage.type === 'success'
                ? 'bg-[#222823] text-white border-[#343D36]'
                : toastMessage.type === 'error'
                ? 'bg-rose-900 text-white border-rose-700'
                : 'bg-[#EFE9DF] text-[#1F2421] border-[#DDD5C7]'
            }`}
          >
            {toastMessage.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
            {toastMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-300" />}
            {toastMessage.type === 'info' && <Sparkles className="w-4 h-4 text-[#C5A059]" />}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenGenerator={() => {
          setActiveTab('studio');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'gallery' && (
          <>
            <Hero
              heroShot={heroShot}
              onGenerateShot={handleGenerateShot}
              onOpenStudio={() => setActiveTab('studio')}
              onOpenCompare={() => setActiveTab('compare')}
            />
            <GalleryGrid
              shots={shots}
              onOpenInStudio={handleOpenInStudio}
              onGenerateQuick={handleGenerateShot}
              onOpenCompare={() => setActiveTab('compare')}
            />
          </>
        )}

        {activeTab === 'studio' && (
          <ImageGenerator
            shots={shots}
            selectedShotId={selectedShotId}
            onSelectShot={setSelectedShotId}
            onUpdateShotImage={handleUpdateShotImage}
            history={history}
            onAddToHistory={handleAddToHistory}
            onClearHistory={handleClearHistory}
          />
        )}

        {activeTab === 'compare' && (
          <BeforeAfterComparison
            beforeShot={beforeShot}
            afterShot={afterShot}
            onOpenInStudio={handleOpenInStudio}
            onGenerateShot={handleGenerateShot}
          />
        )}

        {activeTab === 'palette' && (
          <MaterialPalette onDraftPromptWithMaterial={handleDraftWithMaterial} />
        )}

        {activeTab === 'brief' && (
          <StyleBriefView shots={shots} onOpenInStudio={handleOpenInStudio} />
        )}

        {activeTab === 'planner' && (
          <ConsultationPlanner onDraftCustomPrompt={handleDraftCustomPrompt} />
        )}
      </main>

      {/* Editorial Footer */}
      <footer className="bg-[#222823] text-[#FAF8F5] border-t border-[#343D36] py-12 sm:py-16 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <div className="md:span-5 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-sm bg-[#FAF8F5] text-[#222823] flex items-center justify-center font-serif font-bold text-base">
                  O&O
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold tracking-tight">
                    OCHRE & OAK
                  </h3>
                  <p className="text-[11px] text-[#A69C8E] font-mono tracking-wider uppercase">
                    SYDNEY NSW • ARCHITECTURAL RENOVATIONS
                  </p>
                </div>
              </div>
              <p className="text-xs text-[#C5BDB1] font-sans leading-relaxed max-w-sm">
                A photographic and architectural monograph for Australian residential renovations. Dedicated to luminous natural daylight, Tasmanian oak joinery, honed Navona travertine, and timeless Sydney craftsmanship.
              </p>
            </div>

            <div className="md:span-4 space-y-2 text-xs">
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#A69C8E] block">
                Visualisation Engine
              </span>
              <p className="text-white font-mono flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                gemini-3-pro-image-preview
              </p>
              <p className="text-[#A69C8E]">
                Configurable resolution affordance: <span className="text-white font-mono">1K (1024px)</span>, <span className="text-white font-mono">2K (2048px)</span>, and <span className="text-white font-mono">4K (4096px)</span>.
              </p>
              <p className="text-[#A69C8E] text-[11px] pt-1">
                Aspect ratios: 1:1 Square, 16:9 Landscape, 3:4 Portrait, 4:3 Standard, 9:16 Vertical.
              </p>
            </div>

            <div className="md:span-3 space-y-2 text-xs">
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#A69C8E] block">
                Practice Typologies
              </span>
              <ul className="text-[#C5BDB1] space-y-1">
                <li>• Paddington Heritage Terraces</li>
                <li>• Balmain Waterfront Pavilions</li>
                <li>• Mosman Harbor Residences</li>
                <li>• Manly Coastal Additions</li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-[#343D36] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#8C8274] font-mono gap-2">
            <span>© 2026 Ochre & Oak Renovations Sydney NSW. All rights reserved.</span>
            <span>Editorial Architecture • Level Verticals • True-to-life Colour</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
