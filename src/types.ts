export type ImageSize = '1K' | '2K' | '4K';
export type AspectRatio = '1:1' | '16:9' | '3:4' | '4:3' | '9:16';

export interface BrandShot {
  id: number;
  filename: string;
  title: string;
  subtitle: string;
  category: 'exterior' | 'kitchen' | 'bathroom' | 'living' | 'details' | 'process';
  aspectRatioLabel: string;
  aspectRatio: AspectRatio;
  prompt: string;
  notes: string;
  focalLength: string;
  lighting: string;
  paletteTags: string[];
  rubyAccent?: boolean;
  defaultImageUrl: string;
  generatedImageUrl?: string;
  lastGeneratedSize?: ImageSize;
  generatedAt?: string;
  pairId?: number; // for before/after linking
}

export interface GenerationRequest {
  shotId?: number;
  prompt: string;
  styleBrief: string;
  aspectRatio: AspectRatio;
  imageSize: ImageSize;
}

export interface GenerationHistoryItem {
  id: string;
  shotId?: number;
  title: string;
  prompt: string;
  aspectRatio: AspectRatio;
  imageSize: ImageSize;
  imageUrl: string;
  timestamp: string;
  model: string;
}

export interface MaterialSample {
  id: string;
  name: string;
  category: string;
  hex: string;
  description: string;
  finish: string;
  role: string;
}
