import { FrameTheme, LayoutType, PhotoFilterId, PlacedSticker } from '../types/frames';

interface ExportOptions {
  photos: string[]; // 4 photos
  theme: FrameTheme;
  layout: LayoutType;
  filter: PhotoFilterId;
  kindergartenName: string;
  className: string;
  dateStr: string;
  footerMsg: string;
  stickers: PlacedSticker[];
}

/**
 * Apply CSS filter string to canvas context
 */
function applyFilterToContext(ctx: CanvasRenderingContext2D, filter: PhotoFilterId) {
  switch (filter) {
    case 'bright':
      ctx.filter = 'brightness(1.08) contrast(1.04) saturate(1.06)';
      break;
    case 'warm':
      ctx.filter = 'sepia(0.14) brightness(1.04) saturate(1.12)';
      break;
    case 'peach':
      ctx.filter = 'hue-rotate(-10deg) brightness(1.06) saturate(1.18)';
      break;
    case 'vintage_bw':
      ctx.filter = 'grayscale(1) contrast(1.12)';
      break;
    case 'original':
    default:
      ctx.filter = 'none';
      break;
  }
}

/**
 * Loads an image from a Data URL or Image URL
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

/**
 * Renders the entire 4-cut composition onto a high-res HTML5 Canvas
 */
export async function renderPhotoboothToCanvas(options: ExportOptions): Promise<HTMLCanvasElement> {
  const {
    photos,
    theme,
    layout,
    filter,
    kindergartenName,
    className,
    dateStr,
    footerMsg,
    stickers,
  } = options;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Cannot get 2d context');

  // Ensure custom font is ready
  if (typeof document !== 'undefined' && document.fonts) {
    try {
      await document.fonts.load('44px TtukttakGamja');
      await document.fonts.ready;
    } catch {
      // Continue if font load fails
    }
  }

  // Preload all 4 images
  const loadedImages = await Promise.all(photos.map((src) => loadImage(src)));

  if (layout === 'grid_2x2') {
    // 2x2 Postcard Layout: 1200 x 1500 px
    canvas.width = 1200;
    canvas.height = 1500;

    // Background
    ctx.fillStyle = theme.bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Decorative outer border
    ctx.strokeStyle = theme.borderColor;
    ctx.lineWidth = 14;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    // Inner dashed accent border
    ctx.strokeStyle = theme.accentColor + '40';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 8]);
    ctx.strokeRect(34, 34, canvas.width - 68, canvas.height - 68);
    ctx.setLineDash([]);

    // Header Area
    ctx.fillStyle = theme.textColor;
    ctx.textAlign = 'center';

    // Top Header Icon & Kindergarten Name
    ctx.font = 'bold 28px "TtukttakGamja", "Gowun Dodum", sans-serif';
    ctx.fillText(`${theme.headerIcon} ${kindergartenName || '우리들의 행복 유치원'}`, canvas.width / 2, 85);

    // Class Name
    ctx.font = 'bold 46px "TtukttakGamja", "Gaegu", cursive, sans-serif';
    ctx.fillText(`✨ ${className || '햇살반'} 우리들의 네컷 이야기 ✨`, canvas.width / 2, 140);

    // Photo Grid (2x2)
    const marginX = 70;
    const marginY = 175;
    const gap = 24;
    const photoW = (canvas.width - marginX * 2 - gap) / 2; // ~518px
    const photoH = photoW * 0.75; // 4:3 aspect ratio ~388px

    const positions = [
      { x: marginX, y: marginY },
      { x: marginX + photoW + gap, y: marginY },
      { x: marginX, y: marginY + photoH + gap },
      { x: marginX + photoW + gap, y: marginY + photoH + gap },
    ];

    positions.forEach((pos, idx) => {
      const img = loadedImages[idx];
      if (!img) return;

      // Photo frame white border
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(0,0,0,0.08)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 4;
      ctx.fillRect(pos.x - 8, pos.y - 8, photoW + 16, photoH + 16);
      ctx.shadowColor = 'transparent';

      // Draw Photo with Filter
      ctx.save();
      applyFilterToContext(ctx, filter);

      // Clip photo with slight rounded corner
      ctx.beginPath();
      ctx.rect(pos.x, pos.y, photoW, photoH);
      ctx.clip();

      // Cover scaling
      const imgAspect = img.width / img.height;
      const targetAspect = photoW / photoH;
      let sx = 0, sy = 0, sw = img.width, sh = img.height;
      if (imgAspect > targetAspect) {
        sw = img.height * targetAspect;
        sx = (img.width - sw) / 2;
      } else {
        sh = img.width / targetAspect;
        sy = (img.height - sh) / 2;
      }
      ctx.drawImage(img, sx, sy, sw, sh, pos.x, pos.y, photoW, photoH);
      ctx.restore();

      // Cut index tag
      ctx.fillStyle = theme.accentColor;
      ctx.beginPath();
      ctx.arc(pos.x + 24, pos.y + 24, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(idx + 1), pos.x + 24, pos.y + 24);
    });

    // Draw Stickers placed in 2x2
    stickers.forEach((sticker) => {
      const sx = (sticker.x / 100) * canvas.width;
      const sy = (sticker.y / 100) * canvas.height;
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate((sticker.rotation * Math.PI) / 180);
      ctx.font = `${Math.round(48 * sticker.scale)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(sticker.emoji, 0, 0);
      ctx.restore();
    });

    // Footer Area
    const footerY = marginY + (photoH + gap) * 2 + 50;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';

    // Message
    ctx.fillStyle = theme.textColor;
    ctx.font = 'bold 34px "TtukttakGamja", "Gaegu", cursive, sans-serif';
    ctx.fillText(footerMsg || '선생님이 너희들을 온 마음 다해 사랑해 ❤️', canvas.width / 2, footerY);

    // Date & Footer Illustration
    ctx.font = '24px "TtukttakGamja", "Gowun Dodum", sans-serif';
    ctx.fillStyle = theme.textColor + 'CC';
    ctx.fillText(`${dateStr} · ${theme.footerIllustration}`, canvas.width / 2, footerY + 45);

    // Decorative side dots
    if (theme.decorations.sideDots) {
      theme.decorations.sideDots.forEach((dotColor, dIdx) => {
        ctx.fillStyle = dotColor;
        ctx.beginPath();
        ctx.arc(50, 400 + dIdx * 90, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(canvas.width - 50, 400 + dIdx * 90, 8, 0, Math.PI * 2);
        ctx.fill();
      });
    }

  } else if (layout === 'double_strip') {
    // Double 1x4 Strip Layout (two identical 1x4 strips side-by-side on one printable page)
    canvas.width = 1200;
    canvas.height = 1800;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const stripW = 540;
    const stripH = 1720;
    const gapBetween = 40;
    const startX1 = (canvas.width - (stripW * 2 + gapBetween)) / 2;
    const startX2 = startX1 + stripW + gapBetween;

    // Render single strip function
    const drawSingleStrip = (originX: number) => {
      // Background
      ctx.fillStyle = theme.bgColor;
      ctx.fillRect(originX, 40, stripW, stripH);

      ctx.strokeStyle = theme.borderColor;
      ctx.lineWidth = 8;
      ctx.strokeRect(originX + 10, 50, stripW - 20, stripH - 20);

      // Top title
      ctx.fillStyle = theme.textColor;
      ctx.textAlign = 'center';
      ctx.font = 'bold 24px "TtukttakGamja", "Gowun Dodum", sans-serif';
      ctx.fillText(`${theme.headerIcon} ${kindergartenName}`, originX + stripW / 2, 95);

      ctx.font = 'bold 34px "TtukttakGamja", "Gaegu", cursive, sans-serif';
      ctx.fillText(`✨ ${className} ✨`, originX + stripW / 2, 135);

      // 4 Photos
      const photoMarginX = 35;
      const photoStartY = 160;
      const pW = stripW - photoMarginX * 2; // 470px
      const pH = pW * 0.72; // ~338px
      const pGap = 20;

      [0, 1, 2, 3].forEach((idx) => {
        const img = loadedImages[idx];
        if (!img) return;
        const py = photoStartY + idx * (pH + pGap);

        // Photo border
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = 'rgba(0,0,0,0.06)';
        ctx.shadowBlur = 8;
        ctx.fillRect(originX + photoMarginX - 6, py - 6, pW + 12, pH + 12);
        ctx.shadowColor = 'transparent';

        // Draw Photo
        ctx.save();
        applyFilterToContext(ctx, filter);
        ctx.beginPath();
        ctx.rect(originX + photoMarginX, py, pW, pH);
        ctx.clip();

        const imgAspect = img.width / img.height;
        const targetAspect = pW / pH;
        let sx = 0, sy = 0, sw = img.width, sh = img.height;
        if (imgAspect > targetAspect) {
          sw = img.height * targetAspect;
          sx = (img.width - sw) / 2;
        } else {
          sh = img.width / targetAspect;
          sy = (img.height - sh) / 2;
        }
        ctx.drawImage(img, sx, sy, sw, sh, originX + photoMarginX, py, pW, pH);
        ctx.restore();
      });

      // Stickers
      stickers.forEach((sticker) => {
        // Map sticker relative to single strip width
        const sx = originX + (sticker.x / 100) * stripW;
        const sy = 40 + (sticker.y / 100) * stripH;
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate((sticker.rotation * Math.PI) / 180);
        ctx.font = `${Math.round(44 * sticker.scale)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(sticker.emoji, 0, 0);
        ctx.restore();
      });

      // Footer
      const fY = photoStartY + 4 * (pH + pGap) + 25;
      ctx.textAlign = 'center';
      ctx.fillStyle = theme.textColor;
      ctx.font = 'bold 26px "TtukttakGamja", "Gaegu", cursive, sans-serif';
      ctx.fillText(footerMsg, originX + stripW / 2, fY);

      ctx.font = '18px "TtukttakGamja", "Gowun Dodum", sans-serif';
      ctx.fillStyle = theme.textColor + 'CC';
      ctx.fillText(`${dateStr} · ${theme.footerIllustration}`, originX + stripW / 2, fY + 35);
    };

    drawSingleStrip(startX1);
    drawSingleStrip(startX2);

    // Cutting dotted line in center
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 40);
    ctx.lineTo(canvas.width / 2, canvas.height - 40);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.font = '18px sans-serif';
    ctx.fillStyle = '#94A3B8';
    ctx.textAlign = 'center';
    ctx.fillText('✂️ 가운데를 오려 친구와 한 줄씩 나눠 가지세요!', canvas.width / 2, 28);

  } else {
    // Single 1x4 Strip Layout (600 x 1800 px)
    canvas.width = 600;
    canvas.height = 1800;

    // Background
    ctx.fillStyle = theme.bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = theme.borderColor;
    ctx.lineWidth = 10;
    ctx.strokeRect(14, 14, canvas.width - 28, canvas.height - 28);

    // Header
    ctx.fillStyle = theme.textColor;
    ctx.textAlign = 'center';
    ctx.font = 'bold 24px "TtukttakGamja", "Gowun Dodum", sans-serif';
    ctx.fillText(`${theme.headerIcon} ${kindergartenName || '우리들의 유치원'}`, canvas.width / 2, 60);

    ctx.font = 'bold 38px "TtukttakGamja", "Gaegu", cursive, sans-serif';
    ctx.fillText(`✨ ${className || '햇살반'} ✨`, canvas.width / 2, 105);

    // 4 Photos
    const photoMarginX = 40;
    const photoStartY = 135;
    const pW = canvas.width - photoMarginX * 2; // 520px
    const pH = pW * 0.72; // ~374px
    const pGap = 24;

    [0, 1, 2, 3].forEach((idx) => {
      const img = loadedImages[idx];
      if (!img) return;
      const py = photoStartY + idx * (pH + pGap);

      // Photo Frame
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(0,0,0,0.08)';
      ctx.shadowBlur = 10;
      ctx.fillRect(photoMarginX - 8, py - 8, pW + 16, pH + 16);
      ctx.shadowColor = 'transparent';

      // Draw Photo
      ctx.save();
      applyFilterToContext(ctx, filter);
      ctx.beginPath();
      ctx.rect(photoMarginX, py, pW, pH);
      ctx.clip();

      const imgAspect = img.width / img.height;
      const targetAspect = pW / pH;
      let sx = 0, sy = 0, sw = img.width, sh = img.height;
      if (imgAspect > targetAspect) {
        sw = img.height * targetAspect;
        sx = (img.width - sw) / 2;
      } else {
        sh = img.width / targetAspect;
        sy = (img.height - sh) / 2;
      }
      ctx.drawImage(img, sx, sy, sw, sh, photoMarginX, py, pW, pH);
      ctx.restore();
    });

    // Stickers
    stickers.forEach((sticker) => {
      const sx = (sticker.x / 100) * canvas.width;
      const sy = (sticker.y / 100) * canvas.height;
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate((sticker.rotation * Math.PI) / 180);
      ctx.font = `${Math.round(48 * sticker.scale)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(sticker.emoji, 0, 0);
      ctx.restore();
    });

    // Footer
    const fY = photoStartY + 4 * (pH + pGap) + 30;
    ctx.textAlign = 'center';
    ctx.fillStyle = theme.textColor;
    ctx.font = 'bold 28px "TtukttakGamja", "Gaegu", cursive, sans-serif';
    ctx.fillText(footerMsg || '사랑스러운 우리들의 추억 💖', canvas.width / 2, fY);

    ctx.font = '20px "TtukttakGamja", "Gowun Dodum", sans-serif';
    ctx.fillStyle = theme.textColor + 'CC';
    ctx.fillText(`${dateStr} · ${theme.footerIllustration}`, canvas.width / 2, fY + 40);
  }

  return canvas;
}
