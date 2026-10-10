import React from 'react';
import { Camera, Sparkles, SlidersHorizontal, Layers, FileText, Compass, Zap } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenGenerator: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenGenerator }) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E8E2D8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo & Editorial Wordmark */}
          <div className="flex items-center space-x-4 cursor-pointer" onClick={() => setActiveTab('gallery')}>
            <div className="w-10 h-10 rounded-sm bg-[#222823] flex items-center justify-center text-[#FAF8F5]">
              <span className="font-serif font-bold text-lg tracking-wider">O&O</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#1F2421]">
                  OCHRE & OAK
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase tracking-widest bg-[#EFE9DF] text-[#695D4E] px-2 py-0.5 rounded font-mono font-medium">
                  SYDNEY NSW
                </span>
              </div>
              <p className="text-[11px] text-[#7A7367] tracking-wider uppercase font-sans">
                Architectural Visualisation & Renovations
              </p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 text-sm font-medium">
            <button
              onClick={() => setActiveTab('gallery')}
              className={`px-3 py-2 rounded-md transition-colors flex items-center space-x-1.5 ${
                activeTab === 'gallery'
                  ? 'bg-[#222823] text-white shadow-xs'
                  : 'text-[#4A453C] hover:text-[#1F2421] hover:bg-[#EFE9DF]/60'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Brand Portfolio</span>
            </button>

            <button
              onClick={() => setActiveTab('studio')}
              className={`px-3 py-2 rounded-md transition-colors flex items-center space-x-1.5 ${
                activeTab === 'studio'
                  ? 'bg-[#222823] text-white shadow-xs'
                  : 'text-[#4A453C] hover:text-[#1F2421] hover:bg-[#EFE9DF]/60'
              }`}
            >
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span>AI Studio (1K/2K/4K)</span>
            </button>

            <button
              onClick={() => setActiveTab('compare')}
              className={`px-3 py-2 rounded-md transition-colors flex items-center space-x-1.5 ${
                activeTab === 'compare'
                  ? 'bg-[#222823] text-white shadow-xs'
                  : 'text-[#4A453C] hover:text-[#1F2421] hover:bg-[#EFE9DF]/60'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Before & After</span>
            </button>

            <button
              onClick={() => setActiveTab('palette')}
              className={`px-3 py-2 rounded-md transition-colors flex items-center space-x-1.5 ${
                activeTab === 'palette'
                  ? 'bg-[#222823] text-white shadow-xs'
                  : 'text-[#4A453C] hover:text-[#1F2421] hover:bg-[#EFE9DF]/60'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Material Palette</span>
            </button>

            <button
              onClick={() => setActiveTab('brief')}
              className={`px-3 py-2 rounded-md transition-colors flex items-center space-x-1.5 ${
                activeTab === 'brief'
                  ? 'bg-[#222823] text-white shadow-xs'
                  : 'text-[#4A453C] hover:text-[#1F2421] hover:bg-[#EFE9DF]/60'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Style Brief</span>
            </button>

            <button
              onClick={() => setActiveTab('planner')}
              className={`px-3 py-2 rounded-md transition-colors flex items-center space-x-1.5 ${
                activeTab === 'planner'
                  ? 'bg-[#222823] text-white shadow-xs'
                  : 'text-[#4A453C] hover:text-[#1F2421] hover:bg-[#EFE9DF]/60'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Sydney Planner</span>
            </button>
          </nav>

          {/* Action Button & Model Pill */}
          <div className="flex items-center space-x-3">
            <div className="hidden lg:flex flex-col text-right">
              <span className="text-[10px] font-mono text-[#7A7367] tracking-wider uppercase flex items-center justify-end gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                gemini-3-pro-image-preview
              </span>
              <span className="text-[11px] font-medium text-[#222823]">
                1K • 2K • 4K Enabled
              </span>
            </div>

            <button
              onClick={onOpenGenerator}
              className="bg-[#222823] hover:bg-[#343D36] text-[#FAF8F5] px-4 py-2.5 rounded text-xs sm:text-sm font-semibold tracking-wide uppercase transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow"
            >
              <Zap className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Launch Studio</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden overflow-x-auto py-2.5 space-x-2 border-t border-[#E8E2D8] text-xs">
          {[
            { id: 'gallery', label: 'Portfolio' },
            { id: 'studio', label: 'AI Studio (1K/2K/4K)' },
            { id: 'compare', label: 'Before & After' },
            { id: 'palette', label: 'Materials' },
            { id: 'brief', label: 'Style Brief' },
            { id: 'planner', label: 'Sydney Planner' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-3 py-1.5 rounded whitespace-nowrap font-medium ${
                activeTab === item.id
                  ? 'bg-[#222823] text-white'
                  : 'bg-[#EFE9DF] text-[#4A453C]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
