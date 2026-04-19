import { useMemo } from "react";

const FLOAT_EMOJIS = [
  "🥺", "💔", "😢", "🥀", "😔", "🙏", "💗", "💕",
  "🤍", "💖", "🫶", "🌷", "🌹", "🌸", "💐", "✨",
];

const PETAL_EMOJIS = ["🌸", "🌺", "🌷", "🌹", "💮", "🏵️"];

const TWINKLE_EMOJIS = ["✨", "🌟", "💫"];

interface FloatItem {
  emoji: string;
  left: number;
  size: number;
  delay: number;
  duration: number;
  drift: number;
  spin: number;
  opacity: number;
}

interface TwinkleItem {
  emoji: string;
  top: number;
  left: number;
  size: number;
  delay: number;
  duration: number;
}

function buildFloating(count: number, pool: string[]): FloatItem[] {
  const items: FloatItem[] = [];
  for (let i = 0; i < count; i++) {
    items.push({
      emoji: pool[Math.floor(Math.random() * pool.length)],
      left: Math.random() * 100,
      size: 22 + Math.random() * 32,
      delay: -Math.random() * 14,
      duration: 8 + Math.random() * 10,
      drift: (Math.random() - 0.5) * 220,
      spin: (Math.random() - 0.5) * 720,
      opacity: 0.65 + Math.random() * 0.3,
    });
  }
  return items;
}

function buildTwinkles(count: number): TwinkleItem[] {
  const items: TwinkleItem[] = [];
  for (let i = 0; i < count; i++) {
    items.push({
      emoji: TWINKLE_EMOJIS[i % TWINKLE_EMOJIS.length],
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: 12 + Math.random() * 18,
      delay: -Math.random() * 4,
      duration: 1.8 + Math.random() * 2.4,
    });
  }
  return items;
}

export default function SorryBackdrop() {
  const rising = useMemo(() => buildFloating(34, FLOAT_EMOJIS), []);
  const falling = useMemo(() => buildFloating(22, PETAL_EMOJIS), []);
  const twinkles = useMemo(() => buildTwinkles(14), []);

  return (
    <div
      aria-hidden
      className="absolute inset-0 pointer-events-none overflow-hidden z-0"
    >
      {/* Soft rose gradient wash */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 70% at 50% 0%, rgba(244, 114, 182, 0.20), transparent 60%), radial-gradient(80% 60% at 50% 100%, rgba(190, 24, 93, 0.25), transparent 65%), linear-gradient(180deg, #1a0a1f 0%, #2a0f23 50%, #1a0a1f 100%)",
        }}
      />

      {/* Decorative pulsing heart SVG — behind everything else */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg
          viewBox="0 0 24 24"
          className="w-[60vmin] h-[60vmin] sorry-soft-pulse"
          style={{
            filter:
              "drop-shadow(0 0 60px rgba(244,114,182,0.45)) drop-shadow(0 0 30px rgba(244,114,182,0.35))",
          }}
        >
          <defs>
            <linearGradient id="sorryHeart" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fda4af" />
              <stop offset="50%" stopColor="#f472b6" />
              <stop offset="100%" stopColor="#be185d" />
            </linearGradient>
          </defs>
          <path
            d="M12 21s-7-4.35-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.65-9.5 9-9.5 9z"
            fill="url(#sorryHeart)"
            opacity="0.55"
          />
        </svg>
      </div>

      {/* Twinkles */}
      <div className="absolute inset-0">
        {twinkles.map((t, i) => (
          <span
            key={`tw-${i}`}
            className="absolute sorry-twinkle select-none"
            style={
              {
                top: `${t.top}%`,
                left: `${t.left}%`,
                fontSize: `${t.size}px`,
                animationDelay: `${t.delay}s`,
                "--dur": `${t.duration}s`,
                filter: "drop-shadow(0 0 6px rgba(255,255,255,0.6))",
              } as React.CSSProperties
            }
          >
            {t.emoji}
          </span>
        ))}
      </div>

      {/* Falling rose petals */}
      <div className="absolute inset-0">
        {falling.map((it, i) => (
          <span
            key={`f-${i}`}
            className="absolute sorry-fall-down select-none"
            style={
              {
                left: `${it.left}%`,
                top: 0,
                fontSize: `${it.size}px`,
                opacity: it.opacity,
                animationDelay: `${it.delay}s`,
                "--dur": `${it.duration + 4}s`,
                "--drift": `${it.drift}px`,
                "--spin": `${it.spin}deg`,
                filter: "drop-shadow(0 2px 10px rgba(244,114,182,0.5))",
              } as React.CSSProperties
            }
          >
            {it.emoji}
          </span>
        ))}
      </div>

      {/* Rising emoji bubbles */}
      <div className="absolute inset-0">
        {rising.map((it, i) => (
          <span
            key={`r-${i}`}
            className="absolute sorry-float-up select-none"
            style={
              {
                left: `${it.left}%`,
                bottom: 0,
                fontSize: `${it.size}px`,
                opacity: it.opacity,
                animationDelay: `${it.delay}s`,
                "--dur": `${it.duration}s`,
                "--drift": `${it.drift}px`,
                "--spin": `${it.spin}deg`,
                filter: "drop-shadow(0 2px 10px rgba(244,114,182,0.45))",
              } as React.CSSProperties
            }
          >
            {it.emoji}
          </span>
        ))}
      </div>

      {/* Bottom petal shimmer */}
      <div
        className="absolute inset-x-0 bottom-0 h-40"
        style={{
          background:
            "linear-gradient(180deg, transparent, rgba(244, 114, 182, 0.14))",
        }}
      />
    </div>
  );
}
