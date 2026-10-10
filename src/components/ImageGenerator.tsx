import React, { useState } from 'react';
import {
  Sparkles,
  Download,
  Copy,
  Check,
  RefreshCw,
  Sliders,
  ChevronDown,
  Layers,
  Info,
  Maximize2,
  Trash2,
  AlertCircle,
  ExternalLink,
  Flame,
  Camera,
  FileImage,
} from 'lucide-react';
import { BrandShot, ImageSize, AspectRatio, GenerationHistoryItem } from '../types';
import { SHARED_STYLE_BRIEF } from '../data/shotsData';
import {
  downloadImageWithResolution,
  getResolutionDimensions,
  ExportFormat,
} from '../utils/imageExport';

interface ImageGeneratorProps {
  shots: BrandShot[];
  selectedShotId?: number;
  onSelectShot: (id: number) => void;
  onUpdateShotImage: (id: number, imageUrl: string, size: ImageSize) => void;
  history: GenerationHistoryItem[];
  onAddToHistory: (item: GenerationHistoryItem) => void;
  onClearHistory: () => void;
}

export const ImageGenerator: React.FC<ImageGeneratorProps> = ({
  shots,
  selectedShotId = 1,
  onSelectShot,
  onUpdateShotImage,
  history,
  onAddToHistory,
  onClearHistory,
}) => {
  const currentShot = shots.find((s) => s.id === selectedShotId) || shots[0];

  // Form states
  const [prompt, setPrompt] = useState<string>(currentShot.prompt);
  const [imageSize, setImageSize] = useState<ImageSize>('2K');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(currentShot.aspectRatio);
  const [includeStyleBrief, setIncludeStyleBrief] = useState<boolean>(true);
  const [showStyleBriefDetails, setShowStyleBriefDetails] = useState<boolean>(false);

  // Execution states
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStage, setGenerationStage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [currentResultUrl, setCurrentResultUrl] = useState<string | null>(
    currentShot.generatedImageUrl || currentShot.defaultImageUrl
  );
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'single' | 'batch'>('single');

  // Export & Download states (PNG/JPG with 1K, 2K, 4K resolution)
  const [exportFormat, setExportFormat] = useState<ExportFormat>('png');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportSuccessMessage, setExportSuccessMessage] = useState<string | null>(null);

  // Computes exact target pixel resolution based on user-selected imageSize (1K, 2K, 4K)
  const targetDimensions = getResolutionDimensions(imageSize, aspectRatio);

  // Batch generation states
  const [batchQueue, setBatchQueue] = useState<number[]>([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number; activeId?: number } | null>(null);
  const [isBatchRunning, setIsBatchRunning] = useState<boolean>(false);

  // When selectedShot changes, update local fields
  const handleShotSelect = (shot: BrandShot) => {
    onSelectShot(shot.id);
    setPrompt(shot.prompt);
    setAspectRatio(shot.aspectRatio);
    setCurrentResultUrl(shot.generatedImageUrl || shot.defaultImageUrl);
    setError(null);
  };

  // Trigger single generation with gemini-3-pro-image-preview
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please provide a prompt description.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    const stages = [
      'Initializing gemini-3-pro-image-preview...',
      'Synthesising Australian morning natural daylight...',
      `Configuring render pipeline for ${imageSize} resolution...`,
      'Aligning Tasmanian oak joinery & honed stone textures...',
      'Refining 24-35mm level perspective & colour fidelity...',
    ];

    let stageIdx = 0;
    setGenerationStage(stages[0]);
    const interval = setInterval(() => {
      stageIdx = (stageIdx + 1) % stages.length;
      setGenerationStage(stages[stageIdx]);
    }, 2800);

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          styleBrief: includeStyleBrief ? SHARED_STYLE_BRIEF : undefined,
          aspectRatio,
          imageSize,
          shotId: currentShot.id,
        }),
      });

      clearInterval(interval);

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate image. Please try again.');
      }

      const generatedUrl = data.imageUrl;
      setCurrentResultUrl(generatedUrl);

      // Update parent shot
      onUpdateShotImage(currentShot.id, generatedUrl, imageSize);

      // Add to history
      const historyItem: GenerationHistoryItem = {
        id: `gen-${Date.now()}`,
        shotId: currentShot.id,
        title: currentShot.title || `Custom Render (${imageSize})`,
        prompt: prompt.trim(),
        aspectRatio,
        imageSize,
        imageUrl: generatedUrl,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        model: 'gemini-3-pro-image-preview',
      };
      onAddToHistory(historyItem);
    } catch (err: any) {
      clearInterval(interval);
      console.error('Generation error:', err);
      setError(
        err.message || 'An error occurred while generating the image with gemini-3-pro-image-preview.'
      );
    } finally {
      setIsGenerating(false);
      setGenerationStage('');
    }
  };

  // Run batch generation through selected shots
  const handleRunBatch = async () => {
    if (batchQueue.length === 0) return;
    setIsBatchRunning(true);
    setBatchProgress({ current: 0, total: batchQueue.length });

    for (let i = 0; i < batchQueue.length; i++) {
      const shotId = batchQueue[i];
      const shot = shots.find((s) => s.id === shotId);
      if (!shot) continue;

      setBatchProgress({ current: i + 1, total: batchQueue.length, activeId: shotId });

      try {
        const response = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: shot.prompt,
            styleBrief: SHARED_STYLE_BRIEF,
            aspectRatio: shot.aspectRatio,
            imageSize,
            shotId: shot.id,
          }),
        });

        const data = await response.json();
        if (data.success && data.imageUrl) {
          onUpdateShotImage(shot.id, data.imageUrl, imageSize);
          onAddToHistory({
            id: `batch-${shot.id}-${Date.now()}`,
            shotId: shot.id,
            title: shot.title,
            prompt: shot.prompt,
            aspectRatio: shot.aspectRatio,
            imageSize,
            imageUrl: data.imageUrl,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            model: 'gemini-3-pro-image-preview',
          });
        }
      } catch (e) {
        console.error(`Batch failed on shot #${shotId}:`, e);
      }
    }

    setIsBatchRunning(false);
    setBatchProgress(null);
  };

  const handleCopyPrompt = () => {
    const fullText = includeStyleBrief
      ? `${SHARED_STYLE_BRIEF}\n\nSPECIFIC SHOT:\n${prompt}`
      : prompt;
    navigator.clipboard.writeText(fullText);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  // High-Resolution Image Export (PNG / JPG utilizing 1K, 2K, 4K settings)
  const handleDownload = async (formatOverride?: ExportFormat, resolutionOverride?: ImageSize) => {
    if (!currentResultUrl) return;

    const chosenFormat = formatOverride || exportFormat;
    // Strictly utilize the selected resolution setting (1K, 2K, 4K) currently displayed in the UI
    const chosenResolution = resolutionOverride || imageSize;

    setIsExporting(true);
    setExportSuccessMessage(null);

    try {
      await downloadImageWithResolution(
        currentResultUrl,
        chosenFormat,
        chosenResolution,
        aspectRatio,
        currentShot.filename
      );

      const dims = getResolutionDimensions(chosenResolution, aspectRatio);
      setExportSuccessMessage(
        `Saved ${chosenResolution} ${chosenFormat.toUpperCase()} (${dims.label})`
      );
      setTimeout(() => setExportSuccessMessage(null), 3500);
    } catch (err: any) {
      console.error('Export error:', err);
      setError('Failed to export image at requested resolution. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header with Model Information */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#E3DCD0] pb-6 mb-8 gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 bg-[#E7DFD1] px-3 py-1 rounded text-xs font-mono text-[#574E41] mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>MODEL: gemini-3-pro-image-preview</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-4xl text-[#1A1F1B] font-bold">
            Architectural Image Studio
          </h2>
          <p className="text-sm sm:text-base text-[#6E6455] mt-1 max-w-2xl font-sans">
            Synthesise photorealistic Sydney architectural and interior imagery with configurable resolution affordance (<span className="font-semibold text-[#1A1F1B]">1K, 2K, 4K</span>) and authentic Australian design brief parameters.
          </p>
        </div>

        {/* Mode Tabs */}
        <div className="flex items-center space-x-2 bg-[#EBE4D8] p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('single')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
              activeTab === 'single'
                ? 'bg-white text-[#1A1F1B] shadow-xs'
                : 'text-[#6E6455] hover:text-[#1A1F1B]'
            }`}
          >
            Single Shot Studio
          </button>
          <button
            onClick={() => setActiveTab('batch')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-all flex items-center space-x-1 ${
              activeTab === 'batch'
                ? 'bg-white text-[#1A1F1B] shadow-xs'
                : 'text-[#6E6455] hover:text-[#1A1F1B]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Batch Queue (12 Prompts)</span>
          </button>
        </div>
      </div>

      {activeTab === 'single' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Column (5 cols) */}
          <div className="lg:span-5 space-y-6 bg-[#FAF8F5] p-6 rounded-xl border border-[#DFD6C7] shadow-xs">
            {/* 1. Shot Preset Selector */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#6E6455] mb-2 flex items-center justify-between">
                <span>Select Brand Shot Preset</span>
                <span className="text-[#8F8474]">12 Curated Prompts</span>
              </label>
              <select
                value={selectedShotId}
                onChange={(e) => {
                  const shot = shots.find((s) => s.id === Number(e.target.value));
                  if (shot) handleShotSelect(shot);
                }}
                className="w-full bg-white border border-[#D5CBBA] rounded-md px-3.5 py-2.5 text-sm text-[#1A1F1B] focus:outline-hidden focus:ring-2 focus:ring-[#C5A059] font-medium"
              >
                {shots.map((shot) => (
                  <option key={shot.id} value={shot.id}>
                    #{shot.id} {shot.filename} — {shot.title} ({shot.aspectRatioLabel})
                  </option>
                ))}
              </select>
            </div>

            {/* 2. IMAGE SIZE AFFORDANCE (1K, 2K, 4K) - Required Feature */}
            <div className="p-4 bg-[#F2EDE2] rounded-lg border border-[#DDD3C1]">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-mono uppercase tracking-wider text-[#3D362C] font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>Image Size Affordance</span>
                </label>
                <span className="text-[11px] font-mono text-[#786E5E]">
                  Active: <strong className="text-[#1A1F1B]">{imageSize}</strong>
                </span>
              </div>
              <p className="text-xs text-[#695E50] mb-3">
                Specify output resolution for <code className="font-mono text-[11px] bg-white/70 px-1 py-0.5 rounded">gemini-3-pro-image-preview</code>:
              </p>

              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    size: '1K' as ImageSize,
                    label: '1K (1024px)',
                    desc: 'Crisp Web & Draft',
                  },
                  {
                    size: '2K' as ImageSize,
                    label: '2K (2048px)',
                    desc: 'Editorial Quality',
                    featured: true,
                  },
                  {
                    size: '4K' as ImageSize,
                    label: '4K (4096px)',
                    desc: 'Architectural Print',
                  },
                ].map((item) => (
                  <button
                    key={item.size}
                    type="button"
                    onClick={() => setImageSize(item.size)}
                    className={`py-2.5 px-2 rounded-md text-center transition-all border flex flex-col items-center justify-center ${
                      imageSize === item.size
                        ? 'bg-[#222823] text-white border-[#222823] shadow-xs'
                        : 'bg-white hover:bg-[#FAF8F5] text-[#3D362C] border-[#D5CBBA]'
                    }`}
                  >
                    <span className="font-mono text-sm font-bold tracking-tight">
                      {item.size}
                    </span>
                    <span className="text-[10px] opacity-80 mt-0.5 leading-tight">
                      {item.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Aspect Ratio Selector */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#6E6455] mb-2 flex items-center justify-between">
                <span>Aspect Ratio</span>
                <span className="text-[#8F8474] font-mono">{aspectRatio}</span>
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {[
                  { ratio: '1:1' as AspectRatio, label: '1:1', desc: 'Square' },
                  { ratio: '16:9' as AspectRatio, label: '16:9', desc: 'Landscape' },
                  { ratio: '3:4' as AspectRatio, label: '4:5 / 3:4', desc: 'Portrait' },
                  { ratio: '4:3' as AspectRatio, label: '4:3', desc: 'Standard' },
                  { ratio: '9:16' as AspectRatio, label: '9:16', desc: 'Vertical' },
                ].map((r) => (
                  <button
                    key={r.ratio}
                    type="button"
                    onClick={() => setAspectRatio(r.ratio)}
                    className={`py-2 px-1 rounded text-center transition-all border ${
                      aspectRatio === r.ratio
                        ? 'bg-[#222823] text-white border-[#222823]'
                        : 'bg-white text-[#4A4235] border-[#D5CBBA] hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <span className="text-xs font-mono font-medium block">{r.label}</span>
                    <span className="text-[9px] opacity-75">{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Prompt Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-mono uppercase tracking-wider text-[#6E6455]">
                  Prompt Description
                </label>
                <button
                  type="button"
                  onClick={() => setPrompt(currentShot.prompt)}
                  className="text-[11px] text-[#8C764D] hover:underline font-mono"
                >
                  Reset to default
                </button>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                className="w-full bg-white border border-[#D5CBBA] rounded-md p-3 text-xs sm:text-sm text-[#1A1F1B] focus:outline-hidden focus:ring-2 focus:ring-[#C5A059] font-sans leading-relaxed resize-y"
                placeholder="Describe architectural composition, materials, lighting, fixtures..."
              />
            </div>

            {/* 5. Shared Style Brief Toggle */}
            <div className="bg-[#FAF8F5] p-3.5 rounded-md border border-[#E3DCD0] space-y-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeStyleBrief}
                    onChange={(e) => setIncludeStyleBrief(e.target.checked)}
                    className="w-4 h-4 rounded text-[#222823] focus:ring-[#C5A059]"
                  />
                  <span className="text-xs font-medium text-[#2E281F]">
                    Apply Australian Architectural Style Brief
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowStyleBriefDetails(!showStyleBriefDetails)}
                  className="text-[11px] text-[#8C764D] hover:underline font-mono"
                >
                  {showStyleBriefDetails ? 'Hide Brief' : 'View Brief'}
                </button>
              </div>

              {showStyleBriefDetails && (
                <div className="mt-2 p-2.5 bg-[#F2EDE2] rounded text-[11px] text-[#554C3F] font-mono leading-relaxed border border-[#DDD3C1] whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {SHARED_STYLE_BRIEF}
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold">Generation Notice</p>
                  <p className="text-[11px] leading-relaxed">{error}</p>
                </div>
              </div>
            )}

            {/* 6. Primary Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full bg-[#222823] hover:bg-[#343D36] disabled:bg-[#857E73] text-[#FAF8F5] py-3.5 px-4 rounded-md text-sm font-semibold tracking-wider uppercase transition-all duration-200 flex items-center justify-center space-x-2 shadow-sm"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#D4AF37]" />
                    <span>Rendering in {imageSize}...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                    <span>Generate with Gemini ({imageSize})</span>
                  </>
                )}
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleCopyPrompt}
                  className="flex-1 py-2 px-3 rounded bg-white hover:bg-[#FAF8F5] text-[#3D362C] border border-[#D5CBBA] text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors"
                >
                  {copiedPrompt ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied with Brief</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#6E6455]" />
                      <span>Copy Full Prompt</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Output Display Column (7 cols) */}
          <div className="lg:span-7 space-y-4">
            <div className="bg-[#FAF8F5] p-4 sm:p-5 rounded-xl border border-[#DFD6C7] shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#E3DCD0] mb-4">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-[#1A1F1B] uppercase tracking-wider">
                    Shot #{currentShot.id}: {currentShot.filename}
                  </span>
                  <span className="text-[10px] bg-[#EFE9DF] text-[#4A453C] px-2 py-0.5 rounded font-mono font-medium">
                    {aspectRatio}
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono font-bold">
                    Target: {imageSize}
                  </span>
                </div>

                <div className="flex items-center space-x-1.5">
                  <span className="text-[11px] font-mono text-[#786E5E] hidden sm:inline">Save:</span>
                  <button
                    onClick={() => handleDownload('png')}
                    disabled={!currentResultUrl || isExporting}
                    className="px-2 py-1 rounded bg-white hover:bg-[#222823] hover:text-white border border-[#D5CBBA] text-[#1A1F1B] font-mono text-xs font-semibold flex items-center gap-1 transition-all shadow-2xs disabled:opacity-50"
                    title={`Download as PNG at ${imageSize} resolution (${targetDimensions.label})`}
                  >
                    <Download className="w-3 h-3" />
                    <span>PNG</span>
                    <span className="text-[9px] opacity-75 font-normal">({imageSize})</span>
                  </button>
                  <button
                    onClick={() => handleDownload('jpg')}
                    disabled={!currentResultUrl || isExporting}
                    className="px-2 py-1 rounded bg-white hover:bg-[#222823] hover:text-white border border-[#D5CBBA] text-[#1A1F1B] font-mono text-xs font-semibold flex items-center gap-1 transition-all shadow-2xs disabled:opacity-50"
                    title={`Download as JPG at ${imageSize} resolution (${targetDimensions.label})`}
                  >
                    <Download className="w-3 h-3" />
                    <span>JPG</span>
                    <span className="text-[9px] opacity-75 font-normal">({imageSize})</span>
                  </button>
                </div>
              </div>

              {/* Viewport Frame */}
              <div className="relative rounded-lg overflow-hidden bg-[#222823] min-h-[380px] sm:min-h-[460px] flex items-center justify-center group">
                {currentResultUrl ? (
                  <img
                    src={currentResultUrl}
                    alt={currentShot.title}
                    className="max-h-[580px] w-full object-contain mx-auto transition-transform duration-300"
                  />
                ) : (
                  <div className="text-center p-8 text-[#9E9587]">
                    <Camera className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Click generate to render image</p>
                  </div>
                )}

                {/* Loading Overlay */}
                {isGenerating && (
                  <div className="absolute inset-0 bg-[#1A1F1B]/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center text-white z-20">
                    <div className="w-14 h-14 rounded-full border-3 border-[#C5A059]/30 border-t-[#C5A059] animate-spin mb-4" />
                    <p className="font-serif text-lg font-semibold text-[#FAF8F5] mb-1">
                      Generating {imageSize} Architectural Render
                    </p>
                    <p className="text-xs font-mono text-[#D4AF37] animate-pulse max-w-sm">
                      {generationStage}
                    </p>
                    <span className="mt-4 text-[10px] font-mono uppercase tracking-widest text-white/50">
                      Model: gemini-3-pro-image-preview
                    </span>
                  </div>
                )}

                {/* Resolution Badge Overlay */}
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded text-white text-[11px] font-mono flex items-center gap-2">
                  <span>gemini-3-pro-image-preview</span>
                  <span className="text-[#D4AF37]">•</span>
                  <span>Size: {currentShot.lastGeneratedSize || imageSize}</span>
                  <span className="text-white/60">({targetDimensions.label})</span>
                </div>
              </div>

              {/* High-Resolution Export & Download Panel utilizing selected resolution */}
              <div className="mt-4 p-4 bg-[#F5EFE4] rounded-lg border border-[#DDD3C1] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <FileImage className="w-4 h-4 text-[#C5A059]" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#2E281F]">
                      Save Image to Device
                    </span>
                    <span className="bg-[#222823] text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                      {imageSize} Setting
                    </span>
                    <span className="text-xs font-mono text-[#6E6455]">
                      ({targetDimensions.label})
                    </span>
                  </div>

                  {/* Format Selector Pills */}
                  <div className="flex items-center space-x-1 bg-white/80 p-0.5 rounded border border-[#D5CBBA]">
                    <button
                      type="button"
                      onClick={() => setExportFormat('png')}
                      className={`px-2.5 py-1 rounded text-xs font-mono font-semibold transition-all ${
                        exportFormat === 'png'
                          ? 'bg-[#222823] text-white shadow-2xs'
                          : 'text-[#554C3F] hover:text-[#1A1F1B]'
                      }`}
                    >
                      PNG (Lossless)
                    </button>
                    <button
                      type="button"
                      onClick={() => setExportFormat('jpg')}
                      className={`px-2.5 py-1 rounded text-xs font-mono font-semibold transition-all ${
                        exportFormat === 'jpg'
                          ? 'bg-[#222823] text-white shadow-2xs'
                          : 'text-[#554C3F] hover:text-[#1A1F1B]'
                      }`}
                    >
                      JPG (Photo)
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  {/* Primary Download Button */}
                  <button
                    type="button"
                    onClick={() => handleDownload()}
                    disabled={!currentResultUrl || isExporting}
                    className="flex-1 bg-[#222823] hover:bg-[#343D36] disabled:bg-[#857E73] text-[#FAF8F5] py-2.5 px-4 rounded text-xs sm:text-sm font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow-xs group"
                  >
                    {isExporting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#D4AF37]" />
                        <span>Exporting {imageSize} {exportFormat.toUpperCase()} ({targetDimensions.label})...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 text-[#D4AF37] group-hover:translate-y-0.5 transition-transform" />
                        <span>
                          Download {exportFormat.toUpperCase()} ({imageSize} • {targetDimensions.label})
                        </span>
                      </>
                    )}
                  </button>

                  {/* Quick alternate format download */}
                  <button
                    type="button"
                    onClick={() => handleDownload(exportFormat === 'png' ? 'jpg' : 'png')}
                    disabled={!currentResultUrl || isExporting}
                    className="bg-white hover:bg-[#FAF8F5] disabled:opacity-50 text-[#222823] border border-[#D5CBBA] py-2.5 px-3 rounded text-xs font-mono font-medium transition-colors flex items-center justify-center space-x-1.5"
                    title={`Directly save as ${exportFormat === 'png' ? 'JPG' : 'PNG'} in ${imageSize} resolution`}
                  >
                    <Download className="w-3.5 h-3.5 text-[#6E6455]" />
                    <span>Save as {exportFormat === 'png' ? 'JPG' : 'PNG'}</span>
                  </button>
                </div>

                {/* Feedback message */}
                {exportSuccessMessage && (
                  <div className="p-2 bg-emerald-100/80 border border-emerald-300 rounded text-xs font-mono text-emerald-900 flex items-center space-x-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>{exportSuccessMessage}</span>
                  </div>
                )}
              </div>

              {/* Shot Details Breakdown */}
              <div className="mt-4 pt-4 border-t border-[#E3DCD0] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[#8F8474] font-mono uppercase text-[10px] block">Lens</span>
                  <span className="font-medium text-[#2E281F]">{currentShot.focalLength}</span>
                </div>
                <div>
                  <span className="text-[#8F8474] font-mono uppercase text-[10px] block">Lighting</span>
                  <span className="font-medium text-[#2E281F] line-clamp-1">{currentShot.lighting}</span>
                </div>
                <div>
                  <span className="text-[#8F8474] font-mono uppercase text-[10px] block">Ruby Accent</span>
                  <span className="font-medium text-[#2E281F]">
                    {currentShot.rubyAccent ? 'Yes (Signature)' : 'No (Neutral)'}
                  </span>
                </div>
                <div>
                  <span className="text-[#8F8474] font-mono uppercase text-[10px] block">Status</span>
                  <span className="font-medium text-[#2E281F]">
                    {currentShot.generatedImageUrl ? 'Custom Generated' : 'Editorial Preset'}
                  </span>
                </div>
              </div>
            </div>

            {/* Generation History Strip */}
            {history.length > 0 && (
              <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#DFD6C7]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#6E6455] font-semibold">
                    Recent Studio Generations ({history.length})
                  </span>
                  <button
                    onClick={onClearHistory}
                    className="text-[11px] text-[#8F8474] hover:text-rose-600 font-mono transition-colors"
                  >
                    Clear History
                  </button>
                </div>

                <div className="flex gap-3 overflow-x-auto pb-2">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setCurrentResultUrl(item.imageUrl);
                        setPrompt(item.prompt);
                        setImageSize(item.imageSize);
                        setAspectRatio(item.aspectRatio);
                      }}
                      className="cursor-pointer shrink-0 w-28 rounded-lg overflow-hidden border border-[#D5CBBA] hover:border-[#222823] transition-all bg-white group"
                    >
                      <div className="aspect-video relative overflow-hidden bg-[#222823]">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <span className="absolute top-1 right-1 bg-black/70 text-white font-mono text-[9px] px-1 rounded">
                          {item.imageSize}
                        </span>
                      </div>
                      <div className="p-1.5 text-[10px]">
                        <p className="font-medium text-[#1A1F1B] truncate">{item.title}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[#8F8474] font-mono text-[9px]">{item.timestamp}</span>
                          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => {
                                downloadImageWithResolution(
                                  item.imageUrl,
                                  'png',
                                  item.imageSize,
                                  item.aspectRatio,
                                  `history-${item.id}`
                                );
                              }}
                              className="text-[9px] font-mono bg-[#EFE9DF] hover:bg-[#222823] hover:text-white px-1 py-0.5 rounded"
                              title={`Save as PNG (${item.imageSize})`}
                            >
                              PNG
                            </button>
                            <button
                              onClick={() => {
                                downloadImageWithResolution(
                                  item.imageUrl,
                                  'jpg',
                                  item.imageSize,
                                  item.aspectRatio,
                                  `history-${item.id}`
                                );
                              }}
                              className="text-[9px] font-mono bg-[#EFE9DF] hover:bg-[#222823] hover:text-white px-1 py-0.5 rounded"
                              title={`Save as JPG (${item.imageSize})`}
                            >
                              JPG
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Batch Queue View */
        <div className="bg-[#FAF8F5] p-6 sm:p-8 rounded-xl border border-[#DFD6C7] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E3DCD0]">
            <div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1A1F1B]">
                Batch Generation Runner (12 Prompts)
              </h3>
              <p className="text-xs sm:text-sm text-[#6E6455] mt-1 font-sans">
                Synthesise all 12 editorial shots sequentially with unified Australian brand brief at your chosen resolution.
              </p>
            </div>

            {/* Batch Resolution Selector */}
            <div className="flex items-center space-x-2 bg-[#F2EDE2] p-2 rounded-lg border border-[#DDD3C1]">
              <span className="text-xs font-mono text-[#554C3F]">Batch Size:</span>
              {(['1K', '2K', '4K'] as ImageSize[]).map((size) => (
                <button
                  key={size}
                  onClick={() => setImageSize(size)}
                  className={`px-3 py-1 rounded text-xs font-mono font-medium transition-all ${
                    imageSize === size
                      ? 'bg-[#222823] text-white'
                      : 'bg-white text-[#3D362C] hover:bg-[#FAF8F5]'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Batch Progress Bar */}
          {batchProgress && (
            <div className="p-4 bg-[#F2EDE2] rounded-lg border border-[#C5A059] space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-semibold text-[#1A1F1B] flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#C5A059]" />
                  Processing Shot #{batchProgress.activeId} ({batchProgress.current} of {batchProgress.total})
                </span>
                <span className="text-[#8C764D]">
                  {Math.round((batchProgress.current / batchProgress.total) * 100)}% Complete
                </span>
              </div>
              <div className="w-full bg-[#E0D7C9] rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#222823] h-full transition-all duration-300"
                  style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Batch Queue Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-[#EFE9DF] text-[#554C3F] font-mono uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3 w-12 text-center">#</th>
                  <th className="p-3">Filename</th>
                  <th className="p-3">Ratio</th>
                  <th className="p-3">Prompt</th>
                  <th className="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3DCD0]">
                {shots.map((shot) => {
                  const isChecked = batchQueue.includes(shot.id);
                  const isCurrentlyGenerating = batchProgress?.activeId === shot.id;
                  return (
                    <tr
                      key={shot.id}
                      className={`hover:bg-[#F5F0E6] transition-colors ${
                        isCurrentlyGenerating ? 'bg-[#FFF9EC]' : ''
                      }`}
                    >
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setBatchQueue([...batchQueue, shot.id]);
                            } else {
                              setBatchQueue(batchQueue.filter((id) => id !== shot.id));
                            }
                          }}
                          disabled={isBatchRunning}
                          className="w-4 h-4 rounded text-[#222823]"
                        />
                      </td>
                      <td className="p-3 font-mono font-bold text-[#1A1F1B] whitespace-nowrap">
                        {shot.filename}
                      </td>
                      <td className="p-3 font-mono text-[#6E6455] whitespace-nowrap">
                        {shot.aspectRatioLabel}
                      </td>
                      <td className="p-3 text-[#3D362C] max-w-md line-clamp-2">
                        {shot.prompt}
                      </td>
                      <td className="p-3 text-right font-mono whitespace-nowrap">
                        {isCurrentlyGenerating ? (
                          <span className="text-[#C5A059] font-bold animate-pulse">Rendering...</span>
                        ) : shot.generatedImageUrl ? (
                          <span className="text-emerald-700 font-medium">Rendered ({shot.lastGeneratedSize || '2K'})</span>
                        ) : (
                          <span className="text-[#8F8474]">Preset Default</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="pt-4 border-t border-[#E3DCD0] flex items-center justify-between">
            <span className="text-xs text-[#6E6455] font-mono">
              Selected {batchQueue.length} of {shots.length} shots to generate in {imageSize}
            </span>

            <button
              onClick={handleRunBatch}
              disabled={isBatchRunning || batchQueue.length === 0}
              className="bg-[#222823] hover:bg-[#343D36] disabled:bg-[#857E73] text-[#FAF8F5] px-6 py-3 rounded-md text-xs sm:text-sm font-semibold tracking-wide uppercase transition-all flex items-center space-x-2 shadow-sm"
            >
              {isBatchRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#D4AF37]" />
                  <span>Processing Batch...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                  <span>Start Batch Queue ({batchQueue.length} Images at {imageSize})</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
