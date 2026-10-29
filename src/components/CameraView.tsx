import React, { useState, useEffect, useRef } from 'react';
import { Camera, SwitchCamera, Sparkles, Upload, Play, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playCountdownBeep, playShutterSound, playCelebrationSound } from '../utils/sound';
import { POSE_PROMPTS } from '../types/frames';
import { generateSampleKindergartenPhotos } from '../utils/samplePhotos';

interface CameraViewProps {
  onPhotosCaptured: (photos: string[]) => void;
}

export const CameraView: React.FC<CameraViewProps> = ({ onPhotosCaptured }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [mirror, setMirror] = useState(true);
  const [countdownDuration, setCountdownDuration] = useState<3 | 5>(3);

  // Capture session state
  const [isCapturingSession, setIsCapturingSession] = useState(false);
  const [currentShotIndex, setCurrentShotIndex] = useState(0); // 0 to 4 (total 5 shots)
  const [countdown, setCountdown] = useState<number | null>(null);
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [isFlashing, setIsFlashing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('카메라 앞에 모여 예쁜 포즈를 취해볼까요?');

  // Initialize camera
  const startCamera = async (facing: 'user' | 'environment' = facingMode) => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      setErrorMessage(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 960 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setHasPermission(true);
    } catch (err: unknown) {
      console.warn('Camera access issue:', err);
      setHasPermission(false);
      setErrorMessage(
        '카메라 권한이 차단되었거나 연결된 카메라가 없습니다. 아래의 "샘플 사진으로 시작하기" 또는 "사진 직접 올리기"를 이용하실 수 있습니다.'
      );
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode]);

  const toggleFacingMode = () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
    setMirror(nextMode === 'user');
  };

  // Capture single frame from video to data URL
  const captureFrame = (): string | null => {
    if (!videoRef.current) return null;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 960;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    if (mirror && facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.92);
  };

  // Automated 5-shot routine with 3-2-1 countdown
  const startShootingSession = () => {
    if (isCapturingSession) return;
    setCapturedPhotos([]);
    setCurrentShotIndex(0);
    setIsCapturingSession(true);
    runShotSequence(0, []);
  };

  const runShotSequence = (shotIdx: number, accumulatedPhotos: string[]) => {
    if (shotIdx >= 5) {
      // Completed all 5 shots!
      setIsCapturingSession(false);
      setCountdown(null);
      setStatusMessage('🎉 와아! 5장의 사진이 모두 멋지게 찍혔어요!');
      playCelebrationSound();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Confetti fallback
      }
      setTimeout(() => {
        onPhotosCaptured(accumulatedPhotos);
      }, 1400);
      return;
    }

    setCurrentShotIndex(shotIdx);
    const currentPose = POSE_PROMPTS[shotIdx];
    setStatusMessage(`${shotIdx + 1}번째 찰칵! ${currentPose.emoji} ${currentPose.title}`);

    // Countdown routine
    let currentCount = countdownDuration;
    setCountdown(currentCount);
    playCountdownBeep(currentCount);

    const interval = setInterval(() => {
      currentCount -= 1;
      if (currentCount > 0) {
        setCountdown(currentCount);
        playCountdownBeep(currentCount);
      } else if (currentCount === 0) {
        // SNAP PHOTO!
        clearInterval(interval);
        setCountdown(null);

        // Flash & Shutter Sound
        setIsFlashing(true);
        playShutterSound();
        setTimeout(() => setIsFlashing(false), 280);

        const photoData = captureFrame();
        const updated = [...accumulatedPhotos, photoData || ''];
        setCapturedPhotos(updated);

        // Check if there are more shots
        if (shotIdx + 1 < 5) {
          const nextPose = POSE_PROMPTS[shotIdx + 1];
          setStatusMessage(`다음 샷 준비! ${nextPose.emoji} ${nextPose.title}`);
          // 2.2 seconds pause between shots for kids to change poses
          setTimeout(() => {
            runShotSequence(shotIdx + 1, updated);
          }, 2200);
        } else {
          // Finish session
          runShotSequence(5, updated);
        }
      }
    }, 1000);
  };

  // Immediate use of cute generated kindergarten sample photos
  const handleUseSamplePhotos = () => {
    const samples = generateSampleKindergartenPhotos();
    playCelebrationSound();
    onPhotosCaptured(samples);
  };

  // Upload local photo files (up to 5)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files).slice(0, 5);
    const promises = fileList.map(
      (file) =>
        new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (ev) => resolve(ev.target?.result as string);
          reader.readAsDataURL(file);
        })
    );

    Promise.all(promises).then((loadedPhotos) => {
      // If user uploaded fewer than 5, supplement with sample photos to make 5
      let fullPhotos = [...loadedPhotos];
      if (fullPhotos.length < 5) {
        const samples = generateSampleKindergartenPhotos();
        fullPhotos = [...fullPhotos, ...samples.slice(fullPhotos.length, 5)];
      }
      playCelebrationSound();
      onPhotosCaptured(fullPhotos);
    });
  };

  const currentPose = POSE_PROMPTS[currentShotIndex] || POSE_PROMPTS[0];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-4 md:py-6 flex flex-col items-center">
      {/* Top Banner Guide for Kindergarten */}
      <div className="w-full bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 mb-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left shadow-xs">
        <div className="flex items-center gap-3">
          <span className="text-3xl animate-bounce-gentle">🐣</span>
          <div>
            <h2 className="text-base font-bold text-amber-950 font-cute text-xl leading-none">
              <span className="text-[#7594ea]">우리반 네컷</span> 사진관에 온 걸 환영해요!
            </h2>
            <p className="text-xs text-amber-800 mt-1">
              카운트다운(3-2-1) 후 총 <span className="font-bold text-amber-700">5장</span>의 사진이 찍혀요. 그 중 가장 마음에 드는 4장을 골라보세요!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Countdown length toggle */}
          <div className="flex items-center gap-1 bg-amber-100/70 p-1 rounded-xl text-xs">
            <span className="text-[11px] text-amber-800 font-medium px-1.5">타이머:</span>
            <button
              type="button"
              disabled={isCapturingSession}
              onClick={() => setCountdownDuration(3)}
              className={`px-2 py-0.5 rounded-lg transition-colors font-bold ${
                countdownDuration === 3 ? 'bg-amber-600 text-white shadow-xs' : 'text-amber-800 hover:bg-amber-200'
              }`}
            >
              3초
            </button>
            <button
              type="button"
              disabled={isCapturingSession}
              onClick={() => setCountdownDuration(5)}
              className={`px-2 py-0.5 rounded-lg transition-colors font-bold ${
                countdownDuration === 5 ? 'bg-amber-600 text-white shadow-xs' : 'text-amber-800 hover:bg-amber-200'
              }`}
            >
              5초 (어린이 맞춤)
            </button>
          </div>
        </div>
      </div>

      {/* Main Viewfinder Box */}
      <div className="relative w-full aspect-4/3 max-w-3xl bg-slate-900 rounded-3xl overflow-hidden shadow-xl border-4 border-amber-200 flex items-center justify-center">
        {/* Live Video Feed */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${mirror ? 'scale-x-[-1]' : ''}`}
        />

        {/* Camera Permission / Error Fallback */}
        {hasPermission === false && (
          <div className="absolute inset-0 bg-slate-900/90 text-white p-6 flex flex-col items-center justify-center text-center z-20">
            <AlertCircle className="w-12 h-12 text-amber-400 mb-3" />
            <h3 className="text-lg font-bold mb-1">카메라에 연결할 수 없습니다</h3>
            <p className="text-sm text-slate-300 max-w-md mb-6">{errorMessage}</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleUseSamplePhotos}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-5 h-5" />
                <span>귀여운 유치원 샘플 사진으로 체험하기</span>
              </button>

              <label className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer">
                <Upload className="w-5 h-5" />
                <span>사진 파일 직접 올리기 (최대 5장)</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}

        {/* Screen Flash Effect when Photo is Taken */}
        {isFlashing && (
          <div className="absolute inset-0 bg-white camera-flash z-30 pointer-events-none" />
        )}

        {/* Top Status & Pose Prompt HUD */}
        <div className="absolute top-4 inset-x-4 flex items-center justify-between pointer-events-none z-10">
          <div className="bg-black/60 backdrop-blur-md text-white px-3.5 py-1.5 rounded-2xl flex items-center gap-2 shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-bold tracking-wide">
              {isCapturingSession ? `촬영 중: ${currentShotIndex + 1} / 5` : '촬영 대기 중'}
            </span>
          </div>

          {/* Pose card during shooting */}
          <div className="bg-white/95 backdrop-blur-md text-amber-950 px-4 py-1.5 rounded-2xl shadow-lg flex items-center gap-2 text-sm font-bold border border-amber-300 animate-bounce-gentle">
            <span className="text-lg">{currentPose.emoji}</span>
            <span>{currentPose.title}</span>
          </div>
        </div>

        {/* 3-2-1 Giant Countdown Overlay */}
        {countdown !== null && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
            <div className="w-36 h-36 rounded-full bg-amber-400/95 border-6 border-white shadow-2xl flex items-center justify-center text-slate-900 font-extrabold text-7xl font-dongle animate-scale-up">
              {countdown}
            </div>
            <p className="mt-4 text-white text-lg font-bold drop-shadow-md bg-black/50 px-4 py-1.5 rounded-full">
              {currentPose.desc}
            </p>
          </div>
        )}

        {/* Cute Kindergarten Corner Stickers inside Viewfinder */}
        <div className="absolute bottom-3 left-3 pointer-events-none opacity-80 text-2xl">
          🌸 🐥
        </div>
        <div className="absolute bottom-3 right-3 pointer-events-none opacity-80 text-2xl">
          💖 🐰
        </div>
      </div>

      {/* Captured shots progress bar */}
      <div className="w-full max-w-3xl mt-4 bg-white rounded-2xl p-3 border border-amber-100 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-amber-900 shrink-0">촬영된 컷:</span>
          <div className="flex items-center gap-2">
            {[0, 1, 2, 3, 4].map((idx) => {
              const photo = capturedPhotos[idx];
              return (
                <div
                  key={idx}
                  className={`w-12 h-12 rounded-xl overflow-hidden border-2 flex items-center justify-center text-xs font-bold transition-all ${
                    photo
                      ? 'border-amber-500 shadow-xs'
                      : idx === currentShotIndex && isCapturingSession
                      ? 'border-amber-400 bg-amber-50 animate-pulse text-amber-600'
                      : 'border-dashed border-slate-300 bg-slate-50 text-slate-400'
                  }`}
                >
                  {photo ? (
                    <img src={photo} alt={`컷 ${idx + 1}`} className="w-full h-full object-cover" />
                  ) : (
                    <span>#{idx + 1}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-xs text-amber-800 font-medium hidden sm:block truncate">
          {statusMessage}
        </p>
      </div>

      {/* Bottom Main Controls */}
      <div className="w-full max-w-3xl mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isCapturingSession}
            onClick={() => setMirror(!mirror)}
            className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium transition-colors"
            title="좌우 반전"
          >
            좌우 반전: {mirror ? '켜짐' : '꺼짐'}
          </button>
          <button
            type="button"
            disabled={isCapturingSession}
            onClick={toggleFacingMode}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
            title="전면/후면 카메라 전환"
          >
            <SwitchCamera className="w-4 h-4" />
          </button>
        </div>

        {/* Primary Action Button: 5컷 찰칵 시작 */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isCapturingSession}
            onClick={startShootingSession}
            className="px-7 py-3 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-bold rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center gap-2.5 text-base cursor-pointer disabled:opacity-50"
          >
            <Camera className="w-5 h-5 text-amber-950" />
            <span>{isCapturingSession ? '촬영 중입니다...' : '5컷 연속 촬영 시작! 📸'}</span>
          </button>
        </div>

        {/* Zero-camera / alternate upload shortcuts */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isCapturingSession}
            onClick={handleUseSamplePhotos}
            className="px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>샘플 사진으로 해보기</span>
          </button>

          <label className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>직접 올리기</span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Kindergarten 5-Pose Guide Reference Banner */}
      <div className="w-full max-w-3xl mt-6 bg-white/70 border border-amber-100 rounded-2xl p-4">
        <h4 className="text-xs font-bold text-amber-900 mb-2 flex items-center gap-1.5">
          <span>💡</span> 우리반 추천 5컷 포즈 모음
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {POSE_PROMPTS.map((pose) => (
            <div
              key={pose.step}
              className="bg-amber-50/50 rounded-xl p-2.5 text-center border border-amber-100/60"
            >
              <div className="text-2xl mb-1">{pose.emoji}</div>
              <div className="text-xs font-bold text-slate-800">{pose.step}. {pose.title}</div>
              <div className="text-[11px] text-slate-500 mt-0.5 leading-tight">{pose.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
