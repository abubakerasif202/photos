import { ImageSize, AspectRatio } from '../types';

export type ExportFormat = 'png' | 'jpg';

export interface ResolutionDetails {
  width: number;
  height: number;
  label: string;
}

/**
 * Returns exact pixel dimensions based on the user-selected resolution (1K, 2K, 4K)
 * and aspect ratio setting.
 */
export function getResolutionDimensions(
  resolution: ImageSize,
  aspectRatio: AspectRatio | string
): ResolutionDetails {
  let longestEdge = 2048;
  if (resolution === '1K') longestEdge = 1024;
  if (resolution === '2K') longestEdge = 2048;
  if (resolution === '4K') longestEdge = 4096;

  let width = longestEdge;
  let height = longestEdge;

  if (aspectRatio === '1:1') {
    const squareSize = resolution === '4K' ? 4096 : longestEdge;
    width = squareSize;
    height = squareSize;
  } else if (aspectRatio === '16:9') {
    width = longestEdge;
    height = Math.round((longestEdge * 9) / 16);
  } else if (aspectRatio === '3:4') {
    const portraitHeight = resolution === '4K' ? 4096 : longestEdge;
    height = portraitHeight;
    width = Math.round((portraitHeight * 3) / 4);
  } else if (aspectRatio === '4:3') {
    const landscapeWidth = resolution === '4K' ? 4096 : longestEdge;
    width = landscapeWidth;
    height = Math.round((landscapeWidth * 3) / 4);
  } else if (aspectRatio === '9:16') {
    height = longestEdge;
    width = Math.round((longestEdge * 9) / 16);
  } else {
    width = longestEdge;
    height = Math.round((longestEdge * 9) / 16);
  }

  return {
    width,
    height,
    label: `${width} × ${height} px`,
  };
}

/**
 * Exports an image URL (data URI or remote) at the exact selected resolution setting
 * (1K, 2K, 4K) into either PNG or JPG format using HTML5 Canvas.
 */
export async function downloadImageWithResolution(
  imageUrl: string,
  format: ExportFormat,
  resolution: ImageSize,
  aspectRatio: AspectRatio | string,
  baseFilename: string
): Promise<void> {
  const { width: targetWidth, height: targetHeight } = getResolutionDimensions(
    resolution,
    aspectRatio
  );

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          throw new Error('Canvas rendering context 2d is not supported');
        }

        // Apply high-quality bicubic smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // For JPG exports, paint a crisp white background to prevent black alpha artefacts
        if (format === 'jpg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, targetWidth, targetHeight);
        }

        // Crop to fill rather than distort room geometry when aspect ratios differ.
        const scale = Math.max(targetWidth / img.naturalWidth, targetHeight / img.naturalHeight);
        const scaledWidth = img.naturalWidth * scale;
        const scaledHeight = img.naturalHeight * scale;
        ctx.drawImage(img, (targetWidth - scaledWidth) / 2, (targetHeight - scaledHeight) / 2, scaledWidth, scaledHeight);

        const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
        const quality = format === 'jpg' ? 0.96 : undefined;
        canvas.toBlob((blob) => {
          if (!blob) { reject(new Error('Unable to encode export image.')); return; }
          const objectUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = objectUrl;
        const extension = format === 'jpg' ? 'jpg' : 'png';
        const cleanName = baseFilename.replace(/[^a-zA-Z0-9_-]/g, '-').toLowerCase();
        link.download = `ochre-oak-${cleanName}-${resolution.toLowerCase()}-${targetWidth}x${targetHeight}.${extension}`;
        document.body.appendChild(link);
        link.click();
          document.body.removeChild(link);
          setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
          resolve();
        }, mimeType, quality);
      } catch (canvasErr) {
        reject(canvasErr);
      }
    };

    img.onerror = (err) => {
      reject(new Error('Could not load image for export. Check its CORS policy or save the original directly.'));
    };

    img.src = imageUrl;
  });
}

