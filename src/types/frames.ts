export type FrameThemeId =
  | 'chick_yellow'
  | 'sprout_green'
  | 'bunny_pink'
  | 'dolphin_blue'
  | 'crayon_rainbow'
  | 'lavender_bear'
  | 'good_job'
  | 'classic_ivory';

export type LayoutType = 'strip_1x4' | 'grid_2x2' | 'double_strip';

export type PhotoFilterId = 'original' | 'bright' | 'warm' | 'peach' | 'vintage_bw';

export interface FrameTheme {
  id: FrameThemeId;
  name: string;
  tagline: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  accentColor: string;
  badgeEmoji: string;
  headerIcon: string;
  footerIllustration: string;
  decorations: {
    topRight?: string;
    bottomLeft?: string;
    sideDots?: string[];
  };
}

export interface PlacedSticker {
  id: string;
  emoji: string;
  label: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  scale: number;
  rotation: number;
}

export interface StickerOption {
  id: string;
  emoji: string;
  label: string;
  category: '칭찬과 축하' | '귀여운 동물' | '자연과 반짝이' | '변신 소품';
}

export const STICKER_OPTIONS: StickerOption[] = [
  // 칭찬과 축하
  { id: 'stamp_good', emoji: '💮', label: '참 잘했어요', category: '칭찬과 축하' },
  { id: 'crown', emoji: '👑', label: '멋쟁이 왕관', category: '칭찬과 축하' },
  { id: 'medal', emoji: '🥇', label: '금메달', category: '칭찬과 축하' },
  { id: 'party', emoji: '🎉', label: '축하 꽃가루', category: '칭찬과 축하' },
  { id: 'balloon', emoji: '🎈', label: '알록달록 풍선', category: '칭찬과 축하' },
  // 귀여운 동물
  { id: 'chick', emoji: '🐥', label: '아기 병아리', category: '귀여운 동물' },
  { id: 'bunny', emoji: '🐰', label: '깡총 토끼', category: '귀여운 동물' },
  { id: 'bear', emoji: '🐻', label: '포근 곰돌이', category: '귀여운 동물' },
  { id: 'cat', emoji: '🐱', label: '야옹이', category: '귀여운 동물' },
  { id: 'puppy', emoji: '🐶', label: '멍멍 강아지', category: '귀여운 동물' },
  // 자연과 반짝이
  { id: 'cherry_blossom', emoji: '🌸', label: '꽃송이', category: '자연과 반짝이' },
  { id: 'clover', emoji: '🍀', label: '행운 클로버', category: '자연과 반짝이' },
  { id: 'sun', emoji: '☀️', label: '방긋 햇님', category: '자연과 반짝이' },
  { id: 'rainbow', emoji: '🌈', label: '무지개', category: '자연과 반짝이' },
  { id: 'sparkles', emoji: '✨', label: '반짝반짝 별', category: '자연과 반짝이' },
  { id: 'heart', emoji: '💖', label: '두근 하트', category: '자연과 반짝이' },
  // 변신 소품
  { id: 'sunglasses', emoji: '🕶️', label: '멋쟁이 선글라스', category: '변신 소품' },
  { id: 'ribbon', emoji: '🎀', label: '핑크 리본', category: '변신 소품' },
  { id: 'crayon', emoji: '🖍️', label: '색연필', category: '변신 소품' },
  { id: 'magic_wand', emoji: '🪄', label: '요술봉', category: '변신 소품' },
];

export const FRAME_THEMES: Record<FrameThemeId, FrameTheme> = {
  chick_yellow: {
    id: 'chick_yellow',
    name: '삐약삐약 병아리반',
    tagline: '햇살처럼 밝고 귀여운 노랑 프레임',
    bgColor: '#FFF9D7',
    borderColor: '#FEE589',
    textColor: '#854D0E',
    accentColor: '#F59E0B',
    badgeEmoji: '🐥',
    headerIcon: '☀️',
    footerIllustration: '🐥 🌾 🐣',
    decorations: {
      topRight: '✨',
      bottomLeft: '🌼',
      sideDots: ['#FDE047', '#FBBF24', '#F59E0B'],
    },
  },
  sprout_green: {
    id: 'sprout_green',
    name: '무럭무럭 새싹반',
    tagline: '푸릇푸릇 쑥쑥 자라나는 연두 프레임',
    bgColor: '#EAF7EE',
    borderColor: '#C6EBD1',
    textColor: '#166534',
    accentColor: '#22C55E',
    badgeEmoji: '🌱',
    headerIcon: '🍀',
    footerIllustration: '🌱 🌿 🪴',
    decorations: {
      topRight: '🌈',
      bottomLeft: '🍀',
      sideDots: ['#86EFAC', '#4ADE80', '#22C55E'],
    },
  },
  bunny_pink: {
    id: 'bunny_pink',
    name: '퐁퐁 딸기토끼반',
    tagline: '달콤하고 사랑스러운 딸기우유 프레임',
    bgColor: '#FFF0F5',
    borderColor: '#FBCFE8',
    textColor: '#9D174D',
    accentColor: '#EC4899',
    badgeEmoji: '🐰',
    headerIcon: '🍓',
    footerIllustration: '🐰 🍓 🎀',
    decorations: {
      topRight: '💖',
      bottomLeft: '🍓',
      sideDots: ['#F9A8D4', '#F472B6', '#EC4899'],
    },
  },
  dolphin_blue: {
    id: 'dolphin_blue',
    name: '퐁당 바다돌고래반',
    tagline: '시원하고 맑은 하늘바다빛 프레임',
    bgColor: '#EBF8FF',
    borderColor: '#BAE6FD',
    textColor: '#075985',
    accentColor: '#0284C7',
    badgeEmoji: '🐬',
    headerIcon: '🫧',
    footerIllustration: '🐬 🫧 🌊',
    decorations: {
      topRight: '⭐',
      bottomLeft: '🫧',
      sideDots: ['#7DD3FC', '#38BDF8', '#0284C7'],
    },
  },
  crayon_rainbow: {
    id: 'crayon_rainbow',
    name: '알록달록 크레파스반',
    tagline: '자유롭게 꿈을 그리는 무지개 프레임',
    bgColor: '#FAF5FF',
    borderColor: '#E9D5FF',
    textColor: '#6B21A8',
    accentColor: '#9333EA',
    badgeEmoji: '🖍️',
    headerIcon: '🎨',
    footerIllustration: '🖍️ 🎨 🌈',
    decorations: {
      topRight: '🎨',
      bottomLeft: '🖍️',
      sideDots: ['#F87171', '#FBBF24', '#34D399', '#60A5FA', '#A78BFA'],
    },
  },
  lavender_bear: {
    id: 'lavender_bear',
    name: '포근 별빛곰돌이반',
    tagline: '몽환적이고 따뜻한 라벤더 보라 프레임',
    bgColor: '#F5F3FF',
    borderColor: '#DDD6FE',
    textColor: '#5B21B6',
    accentColor: '#7C3AED',
    badgeEmoji: '🐻',
    headerIcon: '⭐',
    footerIllustration: '🐻 ⭐ 🌙',
    decorations: {
      topRight: '✨',
      bottomLeft: '☁️',
      sideDots: ['#C4B5FD', '#A78BFA', '#7C3AED'],
    },
  },
  good_job: {
    id: 'good_job',
    name: '참 잘했어요 칭찬반',
    tagline: '우리 아이 최고! 뿌듯한 칭찬 프레임',
    bgColor: '#FFFBEB',
    borderColor: '#FDE68A',
    textColor: '#92400E',
    accentColor: '#D97706',
    badgeEmoji: '💮',
    headerIcon: '🏆',
    footerIllustration: '💮 🏆 🎖️',
    decorations: {
      topRight: '🎉',
      bottomLeft: '💮',
      sideDots: ['#FCD34D', '#F59E0B', '#D97706'],
    },
  },
  classic_ivory: {
    id: 'classic_ivory',
    name: '클래식 포토스튜디오',
    tagline: '앨범에 오래 간직하기 좋은 모던 아이보리',
    bgColor: '#FAFAF9',
    borderColor: '#E7E5E4',
    textColor: '#292524',
    accentColor: '#44403C',
    badgeEmoji: '📷',
    headerIcon: '📸',
    footerIllustration: '✦ OUR PRECIOUS MEMORIES ✦',
    decorations: {
      topRight: '✦',
      bottomLeft: '✦',
      sideDots: ['#D6D3D1', '#A8A29E', '#78716C'],
    },
  },
};

export const POSE_PROMPTS = [
  { step: 1, title: '방긋방긋 미소!', desc: '카메라 보고 예쁘게 활짝 웃어봐요 😊', emoji: '😊' },
  { step: 2, title: '깡총깡총 토끼귀!', desc: '머리 위에 두 손으로 귀를 쫑긋 세워요 🐰', emoji: '🐰' },
  { step: 3, title: '꽃이 피었습니다!', desc: '턱 밑에 두 손으로 예쁜 꽃받침 🌸', emoji: '🌸' },
  { step: 4, title: '사랑해요 하트!', desc: '머리 위나 가슴 앞에 콩닥콩닥 하트 💖', emoji: '💖' },
  { step: 5, title: '우리반 최고 브이!', desc: '신나게 브이 또는 엄지 척! ✌️', emoji: '✌️' },
];
