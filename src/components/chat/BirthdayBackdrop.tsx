import { useMemo } from "react";

// Emoji that drift up from the bottom like released party balloons.
const RISING_EMOJIS = [
  "🎈", "🎈", "🎉", "🎁", "🥳", "🎂", "🧁", "🍰",
  "🎊", "⭐", "✨", "💛", "💜", "🩷", "🎀",
];

// Sparkles scattered across the scene.
const TWINKLE_EMOJIS = ["✨", "🌟", "💫", "⭐"];

// Emoji mixed into the falling confetti.
const CONFETTI_EMOJIS = ["🎉", "🎊", "🎈"];

// Bright, saturated confetti colors for the paper pieces.
const CONFETTI_COLORS = [
  "#fbbf24", // gold
  "#fb7185", // coral
  "#f472b6", // pink
  "#38bdf8", // sky
  "#a78bfa", // violet
  "#34d399", // mint
  "#f87171", // red
];

// Bunting flag colors, alternating across the top garland.
const BUNTING_COLORS = [
  "#fbbf24", "#f472b6", "#38bdf8", "#a78bfa", "#34d399", "#fb7185",
];

// Big, faint birthday illustrations anchored around the edges of the scene.
const DECOR = [
  { emoji: "🎈", top: 9, left: 5, size: 15, dur: 6, delay: 0 },
  { emoji: "🎁", top: 13, left: 82, size: 13, dur: 7, delay: 1.1 },
  { emoji: "🎊", top: 45, left: 2, size: 13, dur: 6.5, delay: 0.5 },
  { emoji: "🎉", top: 41, left: 87, size: 13, dur: 7.5, delay: 1.6 },
  { emoji: "🎂", top: 76, left: 6, size: 16, dur: 6.2, delay: 0.8 },
  { emoji: "🧁", top: 79, left: 83, size: 14, dur: 7.2, delay: 0.3 },
];

interface RiseItem {
  emoji: string;
  left: number;
  size: number;
  delay: number;
  duration: number;
  drift: number;
  spin: number;
  peak: number;
}

interface ConfettiItem {
  kind: "paper" | "emoji";
  emoji: string;
  color: string;
  left: number;
  size: number;
  ratio: number;
  round: boolean;
  delay: number;
  duration: number;
  drift: number;
  spin: number;
  peak: number;
}

interface TwinkleItem {
  emoji: string;
  top: number;
  left: number;
  size: number;
  delay: number;
  duration: number;
}

function buildRising(count: number): RiseItem[] {
  const items: RiseItem[] = [];
  for (let i = 0; i < count; i++) {
    items.push({
      emoji: RISING_EMOJIS[Math.floor(Math.random() * RISING_EMOJIS.length)],
      left: Math.random() * 100,
      size: 24 + Math.random() * 30,
      delay: -Math.random() * 16,
      duration: 9 + Math.random() * 9,
      drift: (Math.random() - 0.5) * 160,
      spin: (Math.random() - 0.5) * 40,
      peak: 0.7 + Math.random() * 0.25,
    });
  }
  return items;
}

function buildConfetti(count: number): ConfettiItem[] {
  const items: ConfettiItem[] = [];
  for (let i = 0; i < count; i++) {
    const isEmoji = i % 6 === 0;
    items.push({
      kind: isEmoji ? "emoji" : "paper",
      emoji: CONFETTI_EMOJIS[Math.floor(Math.random() * CONFETTI_EMOJIS.length)],
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      left: Math.random() * 100,
      size: isEmoji ? 18 + Math.random() * 16 : 7 + Math.random() * 7,
      ratio: 0.4 + Math.random() * 0.9,
      round: Math.random() > 0.7,
      delay: -Math.random() * 8,
      duration: 5 + Math.random() * 6,
      drift: (Math.random() - 0.5) * 260,
      spin: (Math.random() - 0.5) * 1080,
      peak: 0.75 + Math.random() * 0.25,
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
      duration: 1.6 + Math.random() * 2.2,
    });
  }
  return items;
}

const BUNTING_FLAGS = 16;

export default function BirthdayBackdrop() {
  const rising = useMemo(() => buildRising(30), []);
  const confetti = useMemo(() => buildConfetti(48), []);
  const twinkles = useMemo(() => buildTwinkles(16), []);
  const flags = useMemo(
    () =>
      Array.from({ length: BUNTING_FLAGS }, (_, i) => ({
        color: BUNTING_COLORS[i % BUNTING_COLORS.length],
      })),
    [],
  );

  return (
    <div
      aria-hidden
      className="absolute inset-0 pointer-events-none overflow-hidden z-0"
    >
      {/* Warm festive gradient wash */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 70% at 50% 0%, rgba(251, 191, 36, 0.18), transparent 60%), radial-gradient(90% 60% at 50% 100%, rgba(217, 70, 239, 0.22), transparent 65%), linear-gradient(180deg, #1b1030 0%, #241243 52%, #1b1030 100%)",
        }}
      />

      {/* Faint birthday illustrations scattered in the background */}
      <div className="absolute inset-0">
        {DECOR.map((d, i) => (
          <span
            key={`d-${i}`}
            className="absolute bday-sway select-none leading-none"
            style={{
              top: `${d.top}%`,
              left: `${d.left}%`,
              fontSize: `${d.size}vmin`,
              opacity: 0.16,
              animationDuration: `${d.dur}s`,
              animationDelay: `${d.delay}s`,
              filter: "drop-shadow(0 0 22px rgba(251,191,36,0.25))",
            }}
          >
            {d.emoji}
          </span>
        ))}
      </div>

      {/* "Happy Birthday Pakhi" text centerpiece */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center select-none">
        <div
          className="font-bold uppercase text-amber-200/85"
          style={{
            fontSize: "clamp(11px, 3vmin, 20px)",
            letterSpacing: "0.34em",
            textShadow: "0 0 18px rgba(251,191,36,0.5)",
          }}
        >
          🎉 Happy Birthday 🎉
        </div>
        <div
          className="bday-shimmer leading-none"
          style={{
            fontFamily:
              '"Brush Script MT", "Snell Roundhand", "Segoe Script", cursive',
            fontSize: "clamp(72px, 26vmin, 240px)",
            fontWeight: 700,
            backgroundImage:
              "linear-gradient(110deg, #c084fc 0%, #f472b6 25%, #fde68a 50%, #f9a8d4 75%, #c084fc 100%)",
            backgroundSize: "220% 100%",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            WebkitTextFillColor: "transparent",
            paddingBottom: "0.16em",
            filter:
              "drop-shadow(0 4px 26px rgba(244,114,182,0.5)) drop-shadow(0 0 44px rgba(251,191,36,0.32))",
          }}
        >
          Pakhi
        </div>
      </div>

      {/* Party bunting garland across the top */}
      <div className="absolute top-0 inset-x-0 bday-sway">
        <div
          className="absolute top-[13px] inset-x-[-4%] h-[2px]"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)",
          }}
        />
        <div className="flex justify-between px-[3%] pt-3">
          {flags.map((f, i) => (
            <span
              key={`bt-${i}`}
              style={{
                width: 0,
                height: 0,
                borderLeft: "11px solid transparent",
                borderRight: "11px solid transparent",
                borderTop: `18px solid ${f.color}`,
                filter: `drop-shadow(0 2px 4px ${f.color}66)`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Twinkles */}
      <div className="absolute inset-0">
        {twinkles.map((t, i) => (
          <span
            key={`tw-${i}`}
            className="absolute bday-twinkle select-none"
            style={
              {
                top: `${t.top}%`,
                left: `${t.left}%`,
                fontSize: `${t.size}px`,
                animationDelay: `${t.delay}s`,
                "--dur": `${t.duration}s`,
                filter: "drop-shadow(0 0 6px rgba(255,236,170,0.7))",
              } as React.CSSProperties
            }
          >
            {t.emoji}
          </span>
        ))}
      </div>

      {/* Falling confetti */}
      <div className="absolute inset-0">
        {confetti.map((c, i) =>
          c.kind === "emoji" ? (
            <span
              key={`c-${i}`}
              className="absolute bday-fall select-none"
              style={
                {
                  left: `${c.left}%`,
                  top: 0,
                  fontSize: `${c.size}px`,
                  animationDelay: `${c.delay}s`,
                  "--dur": `${c.duration}s`,
                  "--drift": `${c.drift}px`,
                  "--spin": `${c.spin}deg`,
                  "--peak": c.peak,
                  filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.25))",
                } as React.CSSProperties
              }
            >
              {c.emoji}
            </span>
          ) : (
            <span
              key={`c-${i}`}
              className="absolute bday-fall"
              style={
                {
                  left: `${c.left}%`,
                  top: 0,
                  width: `${c.size}px`,
                  height: `${c.size * c.ratio}px`,
                  backgroundColor: c.color,
                  borderRadius: c.round ? "9999px" : "1px",
                  animationDelay: `${c.delay}s`,
                  "--dur": `${c.duration}s`,
                  "--drift": `${c.drift}px`,
                  "--spin": `${c.spin}deg`,
                  "--peak": c.peak,
                  boxShadow: `0 1px 4px ${c.color}55`,
                } as React.CSSProperties
              }
            />
          ),
        )}
      </div>

      {/* Rising balloons & party emoji */}
      <div className="absolute inset-0">
        {rising.map((it, i) => (
          <span
            key={`r-${i}`}
            className="absolute bday-rise select-none"
            style={
              {
                left: `${it.left}%`,
                bottom: 0,
                fontSize: `${it.size}px`,
                animationDelay: `${it.delay}s`,
                "--dur": `${it.duration}s`,
                "--drift": `${it.drift}px`,
                "--spin": `${it.spin}deg`,
                "--peak": it.peak,
                filter: "drop-shadow(0 3px 10px rgba(0,0,0,0.3))",
              } as React.CSSProperties
            }
          >
            {it.emoji}
          </span>
        ))}
      </div>

      {/* Warm glow rising from the bottom */}
      <div
        className="absolute inset-x-0 bottom-0 h-40"
        style={{
          background:
            "linear-gradient(180deg, transparent, rgba(251, 191, 36, 0.12))",
        }}
      />
    </div>
  );
}
