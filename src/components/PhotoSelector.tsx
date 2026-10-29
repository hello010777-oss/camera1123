import React, { useState } from 'react';
import { Check, RotateCcw, ArrowRight, Sparkles, Shuffle } from 'lucide-react';
import { playPopSound } from '../utils/sound';

interface PhotoSelectorProps {
  photos: string[]; // 5 photos
  onSelectComplete: (selectedPhotos: string[]) => void;
  onRetake: () => void;
}

export const PhotoSelector: React.FC<PhotoSelectorProps> = ({
  photos,
  onSelectComplete,
  onRetake,
}) => {
  // Store ordered indices of selected photos, e.g. [0, 1, 2, 3]
  const [selectedIndices, setSelectedIndices] = useState<number[]>([0, 1, 2, 3]);

  const toggleSelect = (index: number) => {
    playPopSound();
    if (selectedIndices.includes(index)) {
      // Remove
      setSelectedIndices(selectedIndices.filter((i) => i !== index));
    } else {
      if (selectedIndices.length < 4) {
        // Add
        setSelectedIndices([...selectedIndices, index]);
      } else {
        // If already 4 selected, replace the last one or notify
        const newArr = [...selectedIndices.slice(0, 3), index];
        setSelectedIndices(newArr);
      }
    }
  };

  const handleQuickPick = (type: 'first4' | 'last4' | 'random') => {
    playPopSound();
    if (type === 'first4') {
      setSelectedIndices([0, 1, 2, 3]);
    } else if (type === 'last4') {
      setSelectedIndices([1, 2, 3, 4]);
    } else {
      // random 4 out of 5
      const all = [0, 1, 2, 3, 4];
      const shuffled = all.sort(() => 0.5 - Math.random()).slice(0, 4);
      setSelectedIndices(shuffled);
    }
  };

  const handleConfirm = () => {
    if (selectedIndices.length !== 4) return;
    playPopSound();
    const orderedPhotos = selectedIndices.map((idx) => photos[idx]);
    onSelectComplete(orderedPhotos);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-4 md:py-6 flex flex-col items-center">
      {/* Header Info */}
      <div className="w-full text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mb-2">
          <span>🐥 총 5장의 사진 중 가장 예쁜 4장을 골라주세요!</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 font-cute">
          어떤 사진이 제일 마음에 드나요?
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          사진을 클릭하면 순서대로 <span className="font-bold text-amber-600">①, ②, ③, ④</span> 번호가 붙어요.
        </p>
      </div>

      {/* Quick selection toolbar */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
        <button
          type="button"
          onClick={() => handleQuickPick('first4')}
          className="px-3 py-1.5 bg-white border border-amber-200 text-xs text-amber-900 font-medium rounded-xl hover:bg-amber-50 transition-colors shadow-2xs"
        >
          1번~4번 사진 선택
        </button>
        <button
          type="button"
          onClick={() => handleQuickPick('last4')}
          className="px-3 py-1.5 bg-white border border-amber-200 text-xs text-amber-900 font-medium rounded-xl hover:bg-amber-50 transition-colors shadow-2xs"
        >
          2번~5번 사진 선택
        </button>
        <button
          type="button"
          onClick={() => handleQuickPick('random')}
          className="px-3 py-1.5 bg-white border border-amber-200 text-xs text-amber-900 font-medium rounded-xl hover:bg-amber-50 transition-colors shadow-2xs flex items-center gap-1"
        >
          <Shuffle className="w-3.5 h-3.5 text-amber-600" />
          <span>골고루 섞어보기</span>
        </button>
      </div>

      {/* 5 Photos Gallery Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4 w-full mb-8">
        {photos.map((photo, idx) => {
          const isSelected = selectedIndices.includes(idx);
          const orderNum = isSelected ? selectedIndices.indexOf(idx) + 1 : null;

          return (
            <div
              key={idx}
              onClick={() => toggleSelect(idx)}
              className={`group relative aspect-4/3 rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 select-none border-3 ${
                isSelected
                  ? 'border-amber-500 shadow-lg scale-102 ring-4 ring-amber-200'
                  : 'border-slate-200 opacity-60 hover:opacity-90 hover:border-slate-300'
              }`}
            >
              <img
                src={photo}
                alt={`촬영 컷 ${idx + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Shot Index Label */}
              <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[11px] font-bold px-2 py-0.5 rounded-lg">
                샷 #{idx + 1}
              </div>

              {/* Selection Badge */}
              <div className="absolute top-2 right-2">
                {isSelected ? (
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-white font-extrabold text-sm flex items-center justify-center shadow-md animate-scale-up">
                    {orderNum}
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-white/70 border border-slate-300 text-slate-400 flex items-center justify-center group-hover:bg-white">
                    <Check className="w-4 h-4 opacity-40" />
                  </div>
                )}
              </div>

              {/* Bottom selection hint */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-white text-[11px] font-medium text-center">
                {isSelected ? `${orderNum}번째 컷으로 배치됨` : '클릭하여 선택'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected 4-Cut Preview Strip Bar */}
      <div className="w-full max-w-2xl bg-white border border-amber-200 rounded-3xl p-5 shadow-xs mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">📸</span>
            <span className="font-bold text-sm text-slate-900 font-cute text-lg">
              선택된 4컷 미리보기 ({selectedIndices.length}/4)
            </span>
          </div>
          <span className="text-xs text-amber-700 font-medium">
            {selectedIndices.length === 4
              ? '✨ 4장이 모두 준비되었어요!'
              : `${4 - selectedIndices.length}장을 더 선택해주세요`}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((slotIdx) => {
            const photoIdx = selectedIndices[slotIdx];
            const hasPhoto = photoIdx !== undefined;

            return (
              <div
                key={slotIdx}
                className="flex flex-col items-center"
              >
                <div
                  className={`relative w-full aspect-4/3 rounded-xl overflow-hidden border-2 flex items-center justify-center ${
                    hasPhoto
                      ? 'border-amber-400 bg-amber-50 shadow-xs'
                      : 'border-dashed border-slate-300 bg-slate-50 text-slate-400'
                  }`}
                >
                  {hasPhoto ? (
                    <>
                      <img
                        src={photos[photoIdx]}
                        alt={`슬롯 ${slotIdx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-1 left-1 w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                        {slotIdx + 1}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs font-bold text-slate-400">{slotIdx + 1}번째 빈칸</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Nav Action Buttons */}
      <div className="flex items-center justify-between w-full max-w-2xl gap-3">
        <button
          type="button"
          onClick={onRetake}
          className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm transition-colors flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>다시 촬영하기</span>
        </button>

        <button
          type="button"
          disabled={selectedIndices.length !== 4}
          onClick={handleConfirm}
          className="px-7 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span>프레임 선택 및 꾸미기 시작!</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
