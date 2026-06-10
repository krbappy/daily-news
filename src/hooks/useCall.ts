import { useCallback, useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { getIceServers } from "../lib/iceServers";

export type CallStatus =
  | "idle"
  | "calling" // we dialed, waiting for the other side
  | "incoming" // they dialed us, waiting for accept/decline
  | "connecting" // negotiating media
  | "connected"; // media flowing

export interface CallApi {
  status: CallStatus;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  micEnabled: boolean;
  camEnabled: boolean;
  error: string | null;
  startCall: () => void;
  acceptCall: () => void;
  declineCall: () => void;
  endCall: () => void;
  toggleMic: () => void;
  toggleCam: () => void;
}

const MEDIA_CONSTRAINTS: MediaStreamConstraints = { video: true, audio: true };

// Set VITE_FORCE_RELAY=true to force all media through TURN (relay only).
// If a call still connects with this on, your TURN server is working.
// Leave it off (or unset) for normal use so STUN can be used when possible.
const FORCE_RELAY = import.meta.env.VITE_FORCE_RELAY === "true";

// Logs which ICE path the connection actually uses:
//   "relay"  → TURN server in use
//   "srflx"  → STUN (server-reflexive)
//   "host"   → direct/local
async function logSelectedCandidate(pc: RTCPeerConnection) {
  try {
    const stats = await pc.getStats();
    stats.forEach((report) => {
      if (
        report.type === "candidate-pair" &&
        report.state === "succeeded" &&
        report.nominated
      ) {
        const local = stats.get(report.localCandidateId);
        const remote = stats.get(report.remoteCandidateId);
        console.log(
          `[call] connected — local=${local?.candidateType} remote=${remote?.candidateType}` +
            (local?.candidateType === "relay" || remote?.candidateType === "relay"
              ? "  ✅ TURN in use"
              : "")
        );
      }
    });
  } catch {
    // stats unavailable — ignore
  }
}

export function useCall(
  currentUserId: string | null,
  otherUserId: string | null
): CallApi {
  const [status, setStatus] = useState<CallStatus>("idle");
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [micEnabled, setMicEnabled] = useState(true);
  const [camEnabled, setCamEnabled] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const pendingCandidates = useRef<RTCIceCandidateInit[]>([]);
  const offerRef = useRef<RTCSessionDescriptionInit | null>(null);
  const statusRef = useRef<CallStatus>("idle");

  const updateStatus = useCallback((s: CallStatus) => {
    statusRef.current = s;
    setStatus(s);
  }, []);

  const send = useCallback((event: string, payload: unknown) => {
    channelRef.current?.send({ type: "broadcast", event, payload });
  }, []);

  const cleanup = useCallback(() => {
    const pc = pcRef.current;
    if (pc) {
      pc.onicecandidate = null;
      pc.ontrack = null;
      pc.onconnectionstatechange = null;
      pc.close();
      pcRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    pendingCandidates.current = [];
    offerRef.current = null;
    setLocalStream(null);
    setRemoteStream(null);
    setMicEnabled(true);
    setCamEnabled(true);
  }, []);

  const getLocalMedia = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia(MEDIA_CONSTRAINTS);
    localStreamRef.current = stream;
    setLocalStream(stream);
    return stream;
  }, []);

  const createPeerConnection = useCallback(async () => {
    const iceServers = await getIceServers();
    const pc = new RTCPeerConnection({
      iceServers,
      ...(FORCE_RELAY ? { iceTransportPolicy: "relay" } : {}),
    });

    pc.onicecandidate = (e) => {
      if (e.candidate) send("candidate", { candidate: e.candidate.toJSON() });
    };
    pc.ontrack = (e) => {
      setRemoteStream(e.streams[0] ?? null);
    };
    pc.onconnectionstatechange = () => {
      const s = pc.connectionState;
      if (s === "connected") {
        updateStatus("connected");
        logSelectedCandidate(pc);
      }
      // "disconnected" is usually a transient blip — ICE tries to recover on
      // its own and moves back to "connected". Only treat "failed"/"closed"
      // as terminal so a brief hiccup doesn't kill the whole call.
      else if (s === "failed" || s === "closed") {
        cleanup();
        updateStatus("idle");
      }
    };

    pcRef.current = pc;
    return pc;
  }, [send, updateStatus, cleanup]);

  // --- Outgoing call ---
  const startCall = useCallback(async () => {
    if (statusRef.current !== "idle") return;
    setError(null);
    try {
      updateStatus("calling");
      const stream = await getLocalMedia();
      const pc = await createPeerConnection();
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      send("offer", { sdp: offer });
    } catch {
      setError("Couldn't access your camera or microphone.");
      cleanup();
      updateStatus("idle");
    }
  }, [getLocalMedia, createPeerConnection, send, updateStatus, cleanup]);

  // --- Accept an incoming call ---
  const acceptCall = useCallback(async () => {
    const offer = offerRef.current;
    if (!offer) return;
    setError(null);
    try {
      updateStatus("connecting");
      const stream = await getLocalMedia();
      const pc = await createPeerConnection();
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      for (const c of pendingCandidates.current) {
        await pc.addIceCandidate(new RTCIceCandidate(c));
      }
      pendingCandidates.current = [];
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      send("answer", { sdp: answer });
    } catch {
      setError("Couldn't access your camera or microphone.");
      send("decline", {});
      cleanup();
      updateStatus("idle");
    }
  }, [getLocalMedia, createPeerConnection, send, updateStatus, cleanup]);

  const declineCall = useCallback(() => {
    send("decline", {});
    cleanup();
    updateStatus("idle");
  }, [send, cleanup, updateStatus]);

  const endCall = useCallback(() => {
    // "calling" but not yet answered → cancel; otherwise → hang up
    send(statusRef.current === "calling" ? "cancel" : "end", {});
    cleanup();
    updateStatus("idle");
  }, [send, cleanup, updateStatus]);

  const toggleMic = useCallback(() => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setMicEnabled(track.enabled);
  }, []);

  const toggleCam = useCallback(() => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setCamEnabled(track.enabled);
  }, []);

  // --- Signaling handlers (stable; read live state via refs) ---
  const handleOffer = useCallback(
    (payload: { sdp: RTCSessionDescriptionInit }) => {
      if (statusRef.current !== "idle") {
        send("decline", {}); // busy
        return;
      }
      offerRef.current = payload.sdp;
      updateStatus("incoming");
    },
    [send, updateStatus]
  );

  const handleAnswer = useCallback(
    async (payload: { sdp: RTCSessionDescriptionInit }) => {
      const pc = pcRef.current;
      if (!pc) return;
      await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
      for (const c of pendingCandidates.current) {
        await pc.addIceCandidate(new RTCIceCandidate(c));
      }
      pendingCandidates.current = [];
    },
    []
  );

  const handleCandidate = useCallback(
    async (payload: { candidate: RTCIceCandidateInit }) => {
      const pc = pcRef.current;
      if (pc?.remoteDescription) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
        } catch {
          // ignore late/duplicate candidates
        }
      } else {
        pendingCandidates.current.push(payload.candidate);
      }
    },
    []
  );

  const handleRemoteHangup = useCallback(() => {
    cleanup();
    updateStatus("idle");
  }, [cleanup, updateStatus]);

  // --- Shared signaling channel ---
  useEffect(() => {
    if (!currentUserId || !otherUserId) return;
    const roomId = [currentUserId, otherUserId].sort().join("__");
    const channel = supabase.channel(`call:${roomId}`, {
      config: { broadcast: { self: false } },
    });
    channel
      .on("broadcast", { event: "offer" }, ({ payload }) => handleOffer(payload))
      .on("broadcast", { event: "answer" }, ({ payload }) => handleAnswer(payload))
      .on("broadcast", { event: "candidate" }, ({ payload }) => handleCandidate(payload))
      .on("broadcast", { event: "decline" }, handleRemoteHangup)
      .on("broadcast", { event: "cancel" }, handleRemoteHangup)
      .on("broadcast", { event: "end" }, handleRemoteHangup)
      .subscribe();
    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [
    currentUserId,
    otherUserId,
    handleOffer,
    handleAnswer,
    handleCandidate,
    handleRemoteHangup,
  ]);

  // Tear down media/peer connection on unmount.
  useEffect(() => () => cleanup(), [cleanup]);

  return {
    status,
    localStream,
    remoteStream,
    micEnabled,
    camEnabled,
    error,
    startCall,
    acceptCall,
    declineCall,
    endCall,
    toggleMic,
    toggleCam,
  };
}
