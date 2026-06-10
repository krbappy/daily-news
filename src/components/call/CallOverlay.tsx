import { useEffect, useRef } from "react";
import { useAppStore } from "../../store/useAppStore";
import { useCallContext } from "./callContext";

function Video({
  stream,
  muted,
  className,
}: {
  stream: MediaStream | null;
  muted?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (ref.current && ref.current.srcObject !== stream) {
      ref.current.srcObject = stream;
    }
  }, [stream]);
  return (
    <video
      ref={ref}
      autoPlay
      playsInline
      muted={muted}
      className={className}
    />
  );
}

export default function CallOverlay() {
  const {
    status,
    localStream,
    remoteStream,
    micEnabled,
    camEnabled,
    error,
    acceptCall,
    declineCall,
    endCall,
    toggleMic,
    toggleCam,
  } = useCallContext();

  const otherUser = useAppStore((s) => s.otherUser);
  const name = otherUser?.display_name || otherUser?.username || "Contact";

  if (status === "idle") return null;

  const inCall = status === "connecting" || status === "connected";

  return (
    <div className="fixed inset-0 z-[60] bg-ink-950 flex flex-col">
      {/* Remote video / status backdrop */}
      <div className="relative flex-1 min-h-0 flex items-center justify-center overflow-hidden">
        {inCall && remoteStream ? (
          <Video
            stream={remoteStream}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-4 text-center px-6">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-semibold shadow-2xl"
              style={{ backgroundColor: otherUser?.avatar_color || "#5b21b6" }}
            >
              {name.charAt(0).toUpperCase()}
            </div>
            <div className="text-white text-xl font-semibold">{name}</div>
            <div className="text-zinc-400 text-sm">
              {status === "calling" && "Calling…"}
              {status === "incoming" && "Incoming video call"}
              {status === "connecting" && "Connecting…"}
            </div>
          </div>
        )}

        {/* Local PiP */}
        {inCall && localStream && (
          <div className="absolute bottom-4 right-4 w-28 sm:w-36 aspect-[3/4] rounded-2xl overflow-hidden border border-white/15 shadow-xl bg-black">
            <Video
              stream={localStream}
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />
            {!camEnabled && (
              <div className="absolute inset-0 bg-ink-900 flex items-center justify-center text-zinc-500 text-xs">
                Camera off
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="px-4 py-2 text-center text-sm text-red-400">{error}</div>
      )}

      {/* Controls */}
      <div className="shrink-0 pb-8 pt-5 px-6 flex items-center justify-center gap-5 bg-gradient-to-t from-black/60 to-transparent">
        {status === "incoming" ? (
          <>
            <button
              onClick={declineCall}
              className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white shadow-lg transition"
              aria-label="Decline"
            >
              <PhoneIcon className="rotate-[135deg]" />
            </button>
            <button
              onClick={acceptCall}
              className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center text-white shadow-lg transition"
              aria-label="Accept"
            >
              <PhoneIcon />
            </button>
          </>
        ) : (
          <>
            {inCall && (
              <button
                onClick={toggleMic}
                className={`w-14 h-14 rounded-full flex items-center justify-center text-white transition ${
                  micEnabled ? "bg-white/10 hover:bg-white/20" : "bg-white text-ink-950"
                }`}
                aria-label={micEnabled ? "Mute" : "Unmute"}
              >
                {micEnabled ? <MicIcon /> : <MicOffIcon />}
              </button>
            )}
            <button
              onClick={endCall}
              className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white shadow-lg transition"
              aria-label="End call"
            >
              <PhoneIcon className="rotate-[135deg]" />
            </button>
            {inCall && (
              <button
                onClick={toggleCam}
                className={`w-14 h-14 rounded-full flex items-center justify-center text-white transition ${
                  camEnabled ? "bg-white/10 hover:bg-white/20" : "bg-white text-ink-950"
                }`}
                aria-label={camEnabled ? "Turn camera off" : "Turn camera on"}
              >
                {camEnabled ? <CamIcon /> : <CamOffIcon />}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* --- icons --- */
const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" className={className} {...stroke}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}
function MicIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" {...stroke}>
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
    </svg>
  );
}
function MicOffIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" {...stroke}>
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
      <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
      <line x1="12" y1="19" x2="12" y2="23" />
    </svg>
  );
}
function CamIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" {...stroke}>
      <path d="M23 7l-7 5 7 5V7z" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  );
}
function CamOffIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" {...stroke}>
      <path d="M16 16v2a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2m4 0h5a2 2 0 0 1 2 2v3l4-3v9" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}
