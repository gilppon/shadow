type Props = {
  size?: number;
  className?: string;
  eyeColor?: string;
  wings?: boolean;
};

/**
 * 그림자 요원 '쉐이드'
 * 까만 복면 + 빛나는 눈 + 붉은 스카프 + 반투명 날개를 가진 닌자 요정.
 */
export default function ShadeFigure({
  size = 120,
  className = "",
  eyeColor = "#8beaff",
  wings = true,
}: Props) {
  const uid = `sh${Math.round(size)}`;
  return (
    <svg
      viewBox="0 0 120 150"
      width={size}
      height={size * 1.25}
      className={className}
      aria-label="쉐이드"
    >
      <defs>
        <linearGradient id={`${uid}-body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a2033" />
          <stop offset="55%" stopColor="#0c1018" />
          <stop offset="100%" stopColor="#05070c" />
        </linearGradient>
        <linearGradient id={`${uid}-scarf`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff7a92" />
          <stop offset="100%" stopColor="#d5234b" />
        </linearGradient>
        <linearGradient id={`${uid}-wing`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#9fd8ff" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#6a8cff" stopOpacity="0.05" />
        </linearGradient>
        <filter id={`${uid}-glow`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* 날개 */}
      {wings && (
        <g className="shade-wings">
          <path
            d="M46 64 C10 32 -4 76 18 96 C32 108 46 96 50 80 Z"
            fill={`url(#${uid}-wing)`}
            stroke="#9fd8ff"
            strokeOpacity="0.35"
            strokeWidth="1"
          />
          <path
            d="M74 64 C110 32 124 76 102 96 C88 108 74 96 70 80 Z"
            fill={`url(#${uid}-wing)`}
            stroke="#9fd8ff"
            strokeOpacity="0.35"
            strokeWidth="1"
          />
        </g>
      )}

      {/* 뒤 스카프 꼬리 */}
      <path
        d="M78 60 C104 70 108 96 94 116 C104 92 92 76 74 72 Z"
        fill={`url(#${uid}-scarf)`}
        opacity="0.85"
      />

      {/* 몸통 */}
      <path
        d="M60 44 C75 44 83 57 83 75 C83 101 72 123 60 127 C48 123 37 101 37 75 C37 57 45 44 60 44 Z"
        fill={`url(#${uid}-body)`}
      />
      {/* 허리띠 */}
      <rect x="40" y="92" width="40" height="6" rx="3" fill="#243049" />

      {/* 머리 + 후드 */}
      <path d="M60 12 L69 2 L56 4 Z" fill="#0c1018" />
      <ellipse cx="60" cy="40" rx="20" ry="19.5" fill={`url(#${uid}-body)`} />
      {/* 복면 밴드 */}
      <path
        d="M41 38 C48 30 72 30 79 38 C79 46 72 52 60 52 C48 52 41 46 41 38 Z"
        fill="#161d2c"
      />
      {/* 눈 */}
      <g filter={`url(#${uid}-glow)`}>
        <ellipse cx="52.5" cy="40" rx="5" ry="3.4" fill={eyeColor} transform="rotate(-11 52.5 40)" />
        <ellipse cx="67.5" cy="40" rx="5" ry="3.4" fill={eyeColor} transform="rotate(11 67.5 40)" />
      </g>

      {/* 스카프 */}
      <path
        d="M42 55 Q60 67 78 55 L79 66 Q60 78 41 66 Z"
        fill={`url(#${uid}-scarf)`}
      />
      <path
        d="M74 62 C88 68 92 84 84 98 C90 82 82 72 72 70 Z"
        fill={`url(#${uid}-scarf)`}
      />

      {/* 발 */}
      <ellipse cx="52" cy="130" rx="8" ry="4.5" fill="#080b12" />
      <ellipse cx="69" cy="130" rx="8" ry="4.5" fill="#080b12" />
    </svg>
  );
}
