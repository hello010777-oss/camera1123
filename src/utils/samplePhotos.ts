/**
 * Generates adorable sample kindergarten photos using HTML5 Canvas
 * Used as immediate fallback or demo mode when camera is unavailable.
 */

export function generateSampleKindergartenPhotos(): string[] {
  if (typeof document === 'undefined') return [];

  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 480;
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];

  const scenes = [
    {
      bg1: '#FEF3C7',
      bg2: '#FDE68A',
      title: '방긋방긋 미소',
      emoji: '😊',
      hatEmoji: '🐥',
      sign: '우리반 최고!',
      color: '#D97706',
    },
    {
      bg1: '#FCE7F3',
      bg2: '#FBCFE8',
      title: '깡총 토끼 포즈',
      emoji: '🐰',
      hatEmoji: '🎀',
      sign: '사랑해요 햇살반',
      color: '#DB2777',
    },
    {
      bg1: '#DCFCE7',
      bg2: '#BBF7D0',
      title: '예쁜 꽃받침',
      emoji: '🌸',
      hatEmoji: '👑',
      sign: '반짝반짝 우리',
      color: '#16A34A',
    },
    {
      bg1: '#E0F2FE',
      bg2: '#BAE6FD',
      title: '하트 뿅뿅',
      emoji: '💖',
      hatEmoji: '⭐',
      sign: '선생님 사랑해요',
      color: '#0284C7',
    },
    {
      bg1: '#F3E8FF',
      bg2: '#E9D5FF',
      title: '신나는 브이 ✌️',
      emoji: '✌️',
      hatEmoji: '🎈',
      sign: '참 잘했어요!',
      color: '#9333EA',
    },
  ];

  return scenes.map((scene, idx) => {
    // 1. Background gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 480);
    grad.addColorStop(0, scene.bg1);
    grad.addColorStop(1, scene.bg2);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 640, 480);

    // 2. Playful confetti / stars in background
    for (let i = 0; i < 20; i++) {
      const x = (i * 37) % 640;
      const y = (i * 29) % 480;
      const r = 4 + (i % 6);
      ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 255, 255, 0.7)' : 'rgba(245, 158, 11, 0.25)';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Cute Kindergarten Child Illustration (Stylized)
    // Head / Face
    ctx.fillStyle = '#FFE4D6';
    ctx.beginPath();
    ctx.arc(320, 240, 110, 0, Math.PI * 2);
    ctx.fill();

    // Blush cheeks
    ctx.fillStyle = 'rgba(244, 114, 182, 0.55)';
    ctx.beginPath();
    ctx.arc(260, 270, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(380, 270, 24, 0, Math.PI * 2);
    ctx.fill();

    // Cute smiling eyes
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';

    // Left eye curve
    ctx.beginPath();
    ctx.arc(275, 235, 16, Math.PI, 0, false);
    ctx.stroke();

    // Right eye curve
    ctx.beginPath();
    ctx.arc(365, 235, 16, Math.PI, 0, false);
    ctx.stroke();

    // Cute open smile
    ctx.fillStyle = '#E11D48';
    ctx.beginPath();
    ctx.arc(320, 270, 26, 0, Math.PI, false);
    ctx.fill();

    // Hair / Bangs
    ctx.fillStyle = '#4B2C20';
    ctx.beginPath();
    ctx.arc(320, 210, 112, Math.PI, 0, false);
    ctx.fill();
    // Front bangs scallops
    for (let b = 0; b < 5; b++) {
      ctx.beginPath();
      ctx.arc(230 + b * 45, 175, 24, 0, Math.PI, false);
      ctx.fill();
    }

    // Kindergarten uniform collar
    ctx.fillStyle = scene.color;
    ctx.beginPath();
    ctx.ellipse(320, 420, 150, 80, 0, 0, Math.PI * 2);
    ctx.fill();

    // White round sailor collar
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(320, 370, 80, 35, 0, 0, Math.PI * 2);
    ctx.fill();

    // Yellow bowtie / badge
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(320, 385, 14, 0, Math.PI * 2);
    ctx.fill();

    // 4. Hat / Head Accessory (drawn with font emoji or icon)
    ctx.font = '68px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(scene.hatEmoji, 320, 95);

    // Pose symbol in hands
    ctx.font = '54px sans-serif';
    ctx.fillText(scene.emoji, 440, 360);

    // 5. Kindergarten Nametag Badge in corner
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.strokeStyle = scene.color;
    ctx.lineWidth = 3;
    const badgeX = 35;
    const badgeY = 30;
    const badgeW = 200;
    const badgeH = 50;
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = scene.color;
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`CUT #${idx + 1} ${scene.title}`, badgeX + badgeW / 2, badgeY + badgeH / 2 + 2);

    return canvas.toDataURL('image/jpeg', 0.92);
  });
}
