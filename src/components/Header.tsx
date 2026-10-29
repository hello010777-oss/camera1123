import React from 'react';
import { Volume2, VolumeX, RotateCcw, Sparkles } from 'lucide-react';
import { isSoundEnabled, toggleSound } from '../utils/sound';

interface HeaderProps {
  currentStep: 'camera' | 'select' | 'edit';
  onReset: () => void;
  onSoundChange?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentStep, onReset, onSoundChange }) => {
  const [muted, setMuted] = React.useState(!isSoundEnabled());

  const handleToggleMute = () => {
    const nextState = toggleSound();
    setMuted(!nextState);
    if (onSoundChange) onSoundChange();
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-amber-100 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center shadow-xs text-xl">
            🐥
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight flex items-center gap-1.5 font-cute text-2xl leading-none">
              <span className="text-[#7594ea]">우리반 네컷</span> <span className="text-amber-500 font-normal text-sm font-sans hidden sm:inline">포토부스</span>
            </h1>
          </div>
        </div>

        {/* Zone 2: Step Flow Indicator */}
        <nav className="hidden md:flex items-center gap-1.5 text-xs font-medium text-slate-500">
          <span className={`px-2.5 py-1 rounded-full transition-colors ${currentStep === 'camera' ? 'bg-amber-100 text-amber-900 font-bold' : 'text-slate-400'}`}>
            1. 5장 찰칵!
          </span>
          <span className="text-slate-300">→</span>
          <span className={`px-2.5 py-1 rounded-full transition-colors ${currentStep === 'select' ? 'bg-amber-100 text-amber-900 font-bold' : 'text-slate-400'}`}>
            2. 베스트 4컷 고르기
          </span>
          <span className="text-slate-300">→</span>
          <span className={`px-2.5 py-1 rounded-full transition-colors ${currentStep === 'edit' ? 'bg-amber-100 text-amber-900 font-bold' : 'text-slate-400'}`}>
            3. 프레임 꾸미기 & 인쇄
          </span>
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleToggleMute}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title={muted ? '소리 켜기' : '소리 끄기 (조용한 교실)'}
            aria-label={muted ? '소리 켜기' : '소리 끄기'}
          >
            {muted ? <VolumeX className="w-5 h-5 text-slate-400" /> : <Volume2 className="w-5 h-5 text-amber-600" />}
          </button>

          {currentStep !== 'camera' && (
            <button
              type="button"
              onClick={onReset}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>처음으로</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
