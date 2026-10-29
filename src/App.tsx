import React, { useState } from 'react';
import { Header } from './components/Header';
import { CameraView } from './components/CameraView';
import { PhotoSelector } from './components/PhotoSelector';
import { PhotoboothEditor } from './components/PhotoboothEditor';

type AppStep = 'camera' | 'select' | 'edit';

export default function App() {
  const [currentStep, setCurrentStep] = useState<AppStep>('camera');

  // Captured 5 photos from camera
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);

  // Selected 4 photos for photobooth
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);

  // Sound state updater
  const [, setSoundState] = useState(0);
  const handleSoundChange = () => setSoundState((v) => v + 1);

  // Transition: 5 photos captured -> Go to selection
  const handlePhotosCaptured = (photos: string[]) => {
    setCapturedPhotos(photos);
    setCurrentStep('select');
  };

  // Transition: 4 photos selected -> Go to editor
  const handleSelectionComplete = (chosen4Photos: string[]) => {
    setSelectedPhotos(chosen4Photos);
    setCurrentStep('edit');
  };

  // Return to camera
  const handleResetToCamera = () => {
    setCapturedPhotos([]);
    setSelectedPhotos([]);
    setCurrentStep('camera');
  };

  // Return to 4-photo selection step
  const handleBackToSelect = () => {
    setCurrentStep('select');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF7] text-slate-800">
      {/* Top Bar Contract Compliant Header */}
      <Header
        currentStep={currentStep}
        onReset={handleResetToCamera}
        onSoundChange={handleSoundChange}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full flex flex-col justify-center py-2 md:py-6">
        {currentStep === 'camera' && (
          <CameraView onPhotosCaptured={handlePhotosCaptured} />
        )}

        {currentStep === 'select' && (
          <PhotoSelector
            photos={capturedPhotos}
            onSelectComplete={handleSelectionComplete}
            onRetake={handleResetToCamera}
          />
        )}

        {currentStep === 'edit' && (
          <PhotoboothEditor
            photos={selectedPhotos}
            onRetake={handleResetToCamera}
            onReselect={handleBackToSelect}
          />
        )}
      </main>

      {/* Clean Kindergarten Footer */}
      <footer className="w-full border-t border-amber-100/80 bg-white/60 py-4 text-center text-xs text-amber-900/70">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="flex items-center gap-1.5 font-medium">
            <span>🐥</span>
            <span>우리들의 소중한 순간을 예쁘게 간직해요 · <span className="text-[#7594ea] font-bold font-cute text-sm">우리반 네컷</span></span>
          </p>
          <div className="flex items-center gap-3 text-[11px] text-amber-800/80">
            <span>3-2-1 카운트다운</span>
            <span>·</span>
            <span>총 5장 촬영 후 4장 선택</span>
            <span>·</span>
            <span>유치원 맞춤 테마 프레임</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
