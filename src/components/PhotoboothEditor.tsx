import React, { useState, useRef, useEffect } from 'react';
import {
  Download,
  Printer,
  Sparkles,
  Palette,
  Type,
  Smile,
  RotateCw,
  Plus,
  Minus,
  Trash2,
  Share2,
  RotateCcw,
  LayoutGrid,
  Rows3,
  Columns2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  FrameThemeId,
  FRAME_THEMES,
  LayoutType,
  PhotoFilterId,
  PlacedSticker,
  STICKER_OPTIONS,
  StickerOption,
} from '../types/frames';
import { renderPhotoboothToCanvas } from '../utils/canvasExporter';
import { playCelebrationSound, playPopSound } from '../utils/sound';

interface PhotoboothEditorProps {
  photos: string[]; // Selected 4 photos
  onRetake: () => void;
  onReselect: () => void;
}

export const PhotoboothEditor: React.FC<PhotoboothEditorProps> = ({
  photos,
  onRetake,
  onReselect,
}) => {
  // Config state
  const [selectedThemeId, setSelectedThemeId] = useState<FrameThemeId>('chick_yellow');
  const [layout, setLayout] = useState<LayoutType>('strip_1x4');
  const [filter, setFilter] = useState<PhotoFilterId>('bright');

  // Custom text state
  const [kindergartenName, setKindergartenName] = useState('행복 유치원');
  const [className, setClassName] = useState('햇살가득 병아리반');
  const [dateStr, setDateStr] = useState(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}.${m}.${d}`;
  });
  const [footerMsg, setFooterMsg] = useState('선생님이 너희들을 온 마음 다해 사랑해 ❤️');

  // Active control tab
  const [activeTab, setActiveTab] = useState<'theme' | 'text' | 'stickers'>('theme');

  // Stickers state
  const [stickers, setStickers] = useState<PlacedSticker[]>([
    {
      id: 'initial_good_job',
      emoji: '💮',
      label: '참 잘했어요',
      x: 82,
      y: 93,
      scale: 1.1,
      rotation: 12,
    },
    {
      id: 'initial_heart',
      emoji: '💖',
      label: '하트',
      x: 18,
      y: 7,
      scale: 0.9,
      rotation: -8,
    },
  ]);
  const [activeStickerId, setActiveStickerId] = useState<string | null>(null);

  // Dragging sticker state
  const previewRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);
  const dragStickerIdRef = useRef<string | null>(null);

  const theme = FRAME_THEMES[selectedThemeId] || FRAME_THEMES.chick_yellow;

  // Filter CSS style for preview
  const getFilterStyle = (): React.CSSProperties => {
    switch (filter) {
      case 'bright':
        return { filter: 'brightness(1.08) contrast(1.04) saturate(1.06)' };
      case 'warm':
        return { filter: 'sepia(0.14) brightness(1.04) saturate(1.12)' };
      case 'peach':
        return { filter: 'hue-rotate(-10deg) brightness(1.06) saturate(1.18)' };
      case 'vintage_bw':
        return { filter: 'grayscale(1) contrast(1.12)' };
      case 'original':
      default:
        return { filter: 'none' };
    }
  };

  // Add sticker
  const handleAddSticker = (item: StickerOption) => {
    playPopSound();
    const newSticker: PlacedSticker = {
      id: `sticker_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      emoji: item.emoji,
      label: item.label,
      x: 35 + Math.random() * 30,
      y: 30 + Math.random() * 40,
      scale: 1,
      rotation: Math.floor(Math.random() * 20) - 10,
    };
    setStickers((prev) => [...prev, newSticker]);
    setActiveStickerId(newSticker.id);
  };

  // Sticker interactions
  const handleStickerRotate = (id: string) => {
    playPopSound();
    setStickers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, rotation: (s.rotation + 15) % 360 } : s))
    );
  };

  const handleStickerScale = (id: string, delta: number) => {
    playPopSound();
    setStickers((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, scale: Math.max(0.6, Math.min(2.5, Number((s.scale + delta).toFixed(1)))) }
          : s
      )
    );
  };

  const handleStickerDelete = (id: string) => {
    playPopSound();
    setStickers((prev) => prev.filter((s) => s.id !== id));
    if (activeStickerId === id) setActiveStickerId(null);
  };

  // Sticker drag handling
  const handlePointerDown = (id: string, e: React.PointerEvent) => {
    e.stopPropagation();
    setActiveStickerId(id);
    dragStickerIdRef.current = id;
    isDraggingRef.current = true;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !dragStickerIdRef.current || !previewRef.current) return;
    const rect = previewRef.current.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;

    const x = Math.max(5, Math.min(95, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(5, Math.min(95, ((clientY - rect.top) / rect.height) * 100));

    setStickers((prev) =>
      prev.map((s) => (s.id === dragStickerIdRef.current ? { ...s, x, y } : s))
    );
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
    dragStickerIdRef.current = null;
  };

  // Export to PNG
  const [isExporting, setIsExporting] = useState(false);
  const handleDownloadPNG = async () => {
    try {
      setIsExporting(true);
      const canvas = await renderPhotoboothToCanvas({
        photos,
        theme,
        layout,
        filter,
        kindergartenName,
        className,
        dateStr,
        footerMsg,
        stickers,
      });

      const link = document.createElement('a');
      const safeClass = className.replace(/\s+/g, '_');
      link.download = `우리반네컷_${safeClass}_${dateStr.replace(/\./g, '')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      playCelebrationSound();
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch {
        // Confetti fallback
      }
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Print view
  const handlePrint = async () => {
    try {
      setIsExporting(true);
      const canvas = await renderPhotoboothToCanvas({
        photos,
        theme,
        layout,
        filter,
        kindergartenName,
        className,
        dateStr,
        footerMsg,
        stickers,
      });

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>우리반 네컷 인쇄 - ${className}</title>
              <style>
                @page { size: auto; margin: 0mm; }
                body {
                  margin: 0;
                  padding: 10px;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  background: white;
                  min-height: 100vh;
                  font-family: sans-serif;
                }
                img {
                  max-width: 95vw;
                  max-height: 95vh;
                  object-fit: contain;
                  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }
              </style>
            </head>
            <body>
              <img src="${canvas.toDataURL('image/png')}" onload="window.print();" />
            </body>
          </html>
        `);
        printWindow.document.close();
      } else {
        window.print();
      }
    } catch (err) {
      console.error('Print failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      className="w-full max-w-6xl mx-auto px-4 py-4 md:py-6"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT / CENTER: Live Photobooth Frame Preview */}
        <div className="lg:col-span-7 flex flex-col items-center">
          {/* Action Bar Above Preview */}
          <div className="w-full flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5 font-cute text-base">
              <span>🖼️</span> <span className="text-[#7594ea]">우리반 네컷</span> 완성본 미리보기
            </span>

            {/* Layout switch buttons */}
            <div className="flex items-center gap-1 bg-white border border-amber-200 p-1 rounded-xl shadow-2xs">
              <button
                type="button"
                onClick={() => {
                  playPopSound();
                  setLayout('strip_1x4');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  layout === 'strip_1x4'
                    ? 'bg-amber-500 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="1줄 세로 네컷"
              >
                <Rows3 className="w-3.5 h-3.5" />
                <span>1줄 세로</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  playPopSound();
                  setLayout('double_strip');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  layout === 'double_strip'
                    ? 'bg-amber-500 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="2줄 나눔 인쇄 (친구와 둘이 한 줄씩 나눠가져요)"
              >
                <Columns2 className="w-3.5 h-3.5" />
                <span>2줄 나눔</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  playPopSound();
                  setLayout('grid_2x2');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  layout === 'grid_2x2'
                    ? 'bg-amber-500 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="2x2 엽서형 카드"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>2x2 엽서</span>
              </button>
            </div>
          </div>

          {/* Frame Container Box */}
          <div
            ref={previewRef}
            className={`relative select-none transition-all shadow-xl rounded-3xl overflow-hidden border-8 ${
              layout === 'grid_2x2'
                ? 'w-full max-w-[440px] aspect-4/5'
                : layout === 'double_strip'
                ? 'w-full max-w-[500px] aspect-2/3'
                : 'w-full max-w-[340px] aspect-1/3'
            }`}
            style={{
              backgroundColor: theme.bgColor,
              borderColor: theme.borderColor,
            }}
            onClick={() => setActiveStickerId(null)}
          >
            {/* Header in Preview */}
            <div className="pt-3 pb-2 px-4 text-center">
              <p
                className="text-xs font-bold tracking-tight"
                style={{ color: theme.textColor }}
              >
                {theme.headerIcon} {kindergartenName || '행복 유치원'}
              </p>
              <h3
                className="text-lg md:text-xl font-bold font-cute leading-tight"
                style={{ color: theme.textColor }}
              >
                ✨ {className || '햇살가득반'} ✨
              </h3>
            </div>

            {/* Photos Layout Rendering */}
            {layout === 'grid_2x2' ? (
              <div className="px-4 py-1 grid grid-cols-2 gap-2">
                {photos.map((src, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-4/3 rounded-xl overflow-hidden bg-white p-1 shadow-xs"
                  >
                    <img
                      src={src}
                      alt={`사진 ${idx + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                      style={getFilterStyle()}
                    />
                    <span
                      className="absolute top-2 left-2 w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center shadow-xs"
                      style={{ backgroundColor: theme.accentColor }}
                    >
                      {idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            ) : layout === 'double_strip' ? (
              <div className="px-3 py-1 grid grid-cols-2 gap-3 relative">
                {/* Dotted cutting separator line */}
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 border-r border-dashed border-slate-400/50 pointer-events-none" />

                {/* Left Strip */}
                <div className="flex flex-col gap-1.5">
                  {photos.map((src, idx) => (
                    <div
                      key={`left_${idx}`}
                      className="aspect-4/3 rounded-lg overflow-hidden bg-white p-1 shadow-2xs"
                    >
                      <img
                        src={src}
                        alt={`사진 ${idx + 1}`}
                        className="w-full h-full object-cover rounded-md"
                        style={getFilterStyle()}
                      />
                    </div>
                  ))}
                </div>

                {/* Right Strip (Duplicate for two kids!) */}
                <div className="flex flex-col gap-1.5">
                  {photos.map((src, idx) => (
                    <div
                      key={`right_${idx}`}
                      className="aspect-4/3 rounded-lg overflow-hidden bg-white p-1 shadow-2xs"
                    >
                      <img
                        src={src}
                        alt={`사진 ${idx + 1}`}
                        className="w-full h-full object-cover rounded-md"
                        style={getFilterStyle()}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // Single 1x4 Strip
              <div className="px-4 py-1 flex flex-col gap-2">
                {photos.map((src, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-4/3 rounded-xl overflow-hidden bg-white p-1 shadow-xs"
                  >
                    <img
                      src={src}
                      alt={`사진 ${idx + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                      style={getFilterStyle()}
                    />
                    <span
                      className="absolute top-2 left-2 w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center shadow-xs"
                      style={{ backgroundColor: theme.accentColor }}
                    >
                      {idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Footer in Preview */}
            <div className="py-2.5 px-4 text-center">
              <p
                className="text-xs font-bold font-cute leading-none"
                style={{ color: theme.textColor }}
              >
                {footerMsg || '사랑스러운 우리들의 추억 💖'}
              </p>
              <p
                className="text-[10px] mt-1 font-medium"
                style={{ color: theme.textColor + 'CC' }}
              >
                {dateStr} · {theme.footerIllustration}
              </p>
            </div>

            {/* Placed Interactive Stickers */}
            {stickers.map((stk) => {
              const isSelected = activeStickerId === stk.id;
              return (
                <div
                  key={stk.id}
                  onPointerDown={(e) => handlePointerDown(stk.id, e)}
                  className={`absolute cursor-grab active:cursor-grabbing transform -translate-x-1/2 -translate-y-1/2 select-none touch-none ${
                    isSelected ? 'ring-2 ring-amber-500 rounded-xl bg-white/40 p-1' : ''
                  }`}
                  style={{
                    left: `${stk.x}%`,
                    top: `${stk.y}%`,
                    transform: `translate(-50%, -50%) rotate(${stk.rotation}deg) scale(${stk.scale})`,
                    fontSize: '28px',
                    zIndex: isSelected ? 30 : 20,
                  }}
                  title="드래그하여 원하는 위치로 옮겨보세요"
                >
                  {stk.emoji}
                </div>
              );
            })}
          </div>

          {/* Active Sticker Mini Controls Bar */}
          {activeStickerId && (
            <div className="mt-3 bg-white border border-amber-200 rounded-2xl p-2 px-3 flex items-center gap-2 shadow-xs text-xs animate-scale-up">
              <span className="font-bold text-amber-900">스티커 조절:</span>
              <button
                type="button"
                onClick={() => handleStickerScale(activeStickerId, 0.2)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700"
                title="크게"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleStickerScale(activeStickerId, -0.2)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700"
                title="작게"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleStickerRotate(activeStickerId)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700"
                title="회전하기"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleStickerDelete(activeStickerId)}
                className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg"
                title="삭제하기"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Quick Print/Download Buttons Under Preview on Mobile */}
          <div className="w-full max-w-md mt-5 flex items-center justify-center gap-3">
            <button
              type="button"
              disabled={isExporting}
              onClick={handleDownloadPNG}
              className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-amber-950" />
              <span>{isExporting ? '저장 중...' : '고화질 사진 저장 (PNG)'}</span>
            </button>

            <button
              type="button"
              disabled={isExporting}
              onClick={handlePrint}
              className="py-3 px-4 rounded-2xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-sm shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-700" />
              <span>인쇄하기</span>
            </button>
          </div>
        </div>

        {/* RIGHT: Customization Control Deck */}
        <div className="lg:col-span-5 bg-white border border-amber-100 rounded-3xl p-5 shadow-xs">
          {/* Tabs */}
          <div className="flex items-center gap-1 p-1 bg-amber-50/70 rounded-2xl mb-5">
            <button
              type="button"
              onClick={() => {
                playPopSound();
                setActiveTab('theme');
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'theme'
                  ? 'bg-white text-amber-950 shadow-xs'
                  : 'text-amber-800 hover:bg-amber-100/60'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>프레임 테마</span>
            </button>
            <button
              type="button"
              onClick={() => {
                playPopSound();
                setActiveTab('text');
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'text'
                  ? 'bg-white text-amber-950 shadow-xs'
                  : 'text-amber-800 hover:bg-amber-100/60'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>글자 & 필터</span>
            </button>
            <button
              type="button"
              onClick={() => {
                playPopSound();
                setActiveTab('stickers');
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'stickers'
                  ? 'bg-white text-amber-950 shadow-xs'
                  : 'text-amber-800 hover:bg-amber-100/60'
              }`}
            >
              <Smile className="w-3.5 h-3.5" />
              <span>스티커 꾸미기</span>
            </button>
          </div>

          {/* TAB 1: FRAME THEMES */}
          {activeTab === 'theme' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  유치원 맞춤 프레임 테마 선택
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {Object.values(FRAME_THEMES).map((th) => {
                    const isSelected = th.id === selectedThemeId;
                    return (
                      <button
                        key={th.id}
                        type="button"
                        onClick={() => {
                          playPopSound();
                          setSelectedThemeId(th.id);
                        }}
                        className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-amber-500 ring-2 ring-amber-200 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                        style={{ backgroundColor: th.bgColor }}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xl">{th.badgeEmoji}</span>
                          <span
                            className="w-4 h-4 rounded-full border"
                            style={{ backgroundColor: th.accentColor }}
                          />
                        </div>
                        <div>
                          <div
                            className="text-xs font-bold leading-tight"
                            style={{ color: th.textColor }}
                          >
                            {th.name}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                            {th.tagline}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Layout description box */}
              <div className="p-3 bg-amber-50/60 border border-amber-200/60 rounded-2xl text-xs text-amber-900">
                <span className="font-bold">💡 출력 꿀팁:</span> 친구와 함께 찍었을 땐{' '}
                <span className="font-bold text-amber-800">[2줄 나눔]</span> 모드를 선택하시면
                한 장에 2줄이 인쇄되어 가위로 오려 나눠 가질 수 있어요!
              </div>
            </div>
          )}

          {/* TAB 2: TEXT & FILTER */}
          {activeTab === 'text' && (
            <div className="space-y-4">
              {/* Photo Filter */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  사진 색감 필터
                </label>
                <div className="grid grid-cols-5 gap-1.5 text-center">
                  {[
                    { id: 'original', name: '자연스런 기본' },
                    { id: 'bright', name: '화사 뽀샤시' },
                    { id: 'warm', name: '따스한 햇살' },
                    { id: 'peach', name: '상큼 복숭아' },
                    { id: 'vintage_bw', name: '감성 흑백' },
                  ].map((flt) => (
                    <button
                      key={flt.id}
                      type="button"
                      onClick={() => {
                        playPopSound();
                        setFilter(flt.id as PhotoFilterId);
                      }}
                      className={`p-2 rounded-xl text-[11px] font-bold border transition-all ${
                        filter === flt.id
                          ? 'border-amber-500 bg-amber-50 text-amber-950 shadow-2xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {flt.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Kindergarten & Class Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    유치원 / 어린이집
                  </label>
                  <input
                    type="text"
                    value={kindergartenName}
                    onChange={(e) => setKindergartenName(e.target.value)}
                    placeholder="예: 햇살 유치원"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    우리 반 이름
                  </label>
                  <input
                    type="text"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    placeholder="예: 새싹반"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">날짜</label>
                <input
                  type="text"
                  value={dateStr}
                  onChange={(e) => setDateStr(e.target.value)}
                  placeholder="예: 2026.10.29"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Footer Message */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  하단 사랑의 한마디 메시지
                </label>
                <input
                  type="text"
                  value={footerMsg}
                  onChange={(e) => setFooterMsg(e.target.value)}
                  placeholder="예: 선생님이 많이 사랑해 ❤️"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-amber-400 mb-2"
                />

                {/* Quick message suggestions */}
                <div className="flex flex-wrap gap-1">
                  {[
                    '선생님이 많이 사랑해 ❤️',
                    '오늘도 반짝반짝 빛나는 우리 ✨',
                    '참 잘했어요 최고예요 👍',
                    '영원히 기억할 우리들의 추억 🌸',
                  ].map((msg) => (
                    <button
                      key={msg}
                      type="button"
                      onClick={() => setFooterMsg(msg)}
                      className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-amber-100 hover:text-amber-900 transition-colors"
                    >
                      {msg}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: STICKERS */}
          {activeTab === 'stickers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">
                  스티커를 누르면 사진 위에 쏙 올라가요!
                </label>
                {stickers.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      playPopSound();
                      setStickers([]);
                      setActiveStickerId(null);
                    }}
                    className="text-[11px] text-rose-600 hover:underline"
                  >
                    스티커 전체 삭제
                  </button>
                )}
              </div>

              {/* Categorized Stickers */}
              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {(['칭찬과 축하', '귀여운 동물', '자연과 반짝이', '변신 소품'] as const).map(
                  (category) => (
                    <div key={category}>
                      <span className="text-[11px] font-bold text-slate-500 mb-1 block">
                        {category}
                      </span>
                      <div className="grid grid-cols-5 gap-2">
                        {STICKER_OPTIONS.filter((s) => s.category === category).map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleAddSticker(item)}
                            className="aspect-square bg-slate-50 hover:bg-amber-100 rounded-xl border border-slate-200 hover:border-amber-300 flex flex-col items-center justify-center p-1 transition-all cursor-pointer shadow-2xs hover:scale-105"
                            title={item.label}
                          >
                            <span className="text-2xl">{item.emoji}</span>
                            <span className="text-[9px] text-slate-600 truncate w-full text-center mt-0.5">
                              {item.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>

              <p className="text-[11px] text-slate-400">
                👉 추가된 스티커는 마우스나 터치로 드래그해서 위치를 자유롭게 바꿀 수 있어요!
              </p>
            </div>
          )}

          {/* Bottom Navigation Buttons */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={onReselect}
              className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 py-1"
            >
              <span>← 사진 4장 다시 고르기</span>
            </button>

            <button
              type="button"
              onClick={onRetake}
              className="text-xs text-amber-700 hover:text-amber-900 font-bold flex items-center gap-1 py-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>처음부터 다시 찍기</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
