import React, { useEffect, useRef, useState } from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  MonitorOff,
  UserX,
  Wifi,
  Pin,
  PinOff,
} from "lucide-react";

const AVATAR_COLORS = [
  "#1a73e8", // Google blue
  "#34a853", // Google green
  "#ea4335", // Google red
  "#fbbc04", // Google yellow
  "#0097a7", // teal
  "#7b1fa2", // deep purple
  "#e64a19", // deep orange
  "#00796b", // dark teal
  "#5c6bc0", // indigo
  "#d81b60", // pink
];

const getAvatarColor = (name = "") => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const ParticipantTile = ({
  participant,
  currentRole,
  onKick,
  mirrorLocalVideo,
  isCurrentUser,
  canPin,
  isPinned,
  onTogglePin,
}) => {
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const activeVideoTrack = participant.screenTrack || participant.videoTrack;
  const [showStats, setShowStats] = useState(false);

  const pingMs =
    typeof participant.pingMs === "number" ? participant.pingMs : null;
  const lossPercent =
    typeof participant.lossPercent === "number"
      ? participant.lossPercent
      : null;

  const getSignalLevel = () => {
    if (pingMs === null) return 0;
    if (lossPercent !== null && lossPercent >= 8) return 1;
    if (pingMs > 250) return 1;
    if (pingMs > 160) return 2;
    if (pingMs > 90) return 3;
    return 4;
  };

  const signalLevel = getSignalLevel();

  useEffect(() => {
    if (activeVideoTrack && videoRef.current) {
      activeVideoTrack.attach(videoRef.current);
    }
    return () => {
      if (activeVideoTrack) {
        activeVideoTrack.detach();
      }
    };
  }, [activeVideoTrack]);

  useEffect(() => {
    if (participant.audioTrack && !isCurrentUser) {
      participant.audioTrack.attach(audioRef.current);
    } else if (participant.audioTrack && isCurrentUser) {
      participant.audioTrack.detach();
    }
    return () => {
      if (participant.audioTrack) {
        participant.audioTrack.detach();
      }
    };
  }, [participant.audioTrack, isCurrentUser]);

  const getPingClass = () => {
    if (pingMs === null) return "";
    if (pingMs > 250) return "ping--bad";
    if (pingMs > 160) return "ping--warn";
    return "ping--good";
  };

  return (
    <div className={`tile${isPinned ? " tile--pinned" : ""}`}>
      {/* ── Video / placeholder ── */}
      {activeVideoTrack ? (
        <div className="tile-video-wrap">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={isCurrentUser}
            className={`video${isCurrentUser && mirrorLocalVideo && !participant.isScreenSharing ? " mirrored" : ""}`}
          />
          {/* Overlay: name + signal always visible on video */}
          <div className="tile-overlay">
            <div className="tile-overlay__left">
              {participant.audioMuted ? (
                <span className="tile-mic-badge tile-mic-badge--off">
                  <MicOff size={12} />
                </span>
              ) : (
                <span className="tile-mic-badge tile-mic-badge--on">
                  <Mic size={12} />
                </span>
              )}
              <span className="tile-overlay__name">
                {participant.name || "Guest"}
                {isCurrentUser ? " (You)" : ""}
              </span>
            </div>
            <div className="signal-badge" title={`Signal: ${signalLevel}/4`}>
              <span
                className={`signal-bar${signalLevel >= 1 ? " active" : ""}`}
              />
              <span
                className={`signal-bar${signalLevel >= 2 ? " active" : ""}`}
              />
              <span
                className={`signal-bar${signalLevel >= 3 ? " active" : ""}`}
              />
              <span
                className={`signal-bar${signalLevel >= 4 ? " active" : ""}`}
              />
            </div>
          </div>

          {/* Teacher kick button — top-right on hover */}
          {currentRole === "teacher" &&
            !participant.isLocal &&
            participant.role !== "teacher" && (
              <button
                className="tile-kick-btn"
                onClick={() => onKick?.(participant.id)}
                title="Remove participant"
              >
                <UserX size={15} />
              </button>
            )}

          {canPin && (
            <button
              className={`tile-pin-btn${isPinned ? " tile-pin-btn--active" : ""}`}
              onClick={() => onTogglePin?.(participant.id)}
              title={isPinned ? "Unpin" : "Pin"}
            >
              {isPinned ? <PinOff size={14} /> : <Pin size={14} />}
            </button>
          )}
        </div>
      ) : (
        <div className="tile-video-wrap tile-video-wrap--blank">
          <div
            className="tile-avatar"
            style={{ background: getAvatarColor(participant.name) }}
          >
            {(participant.name || "G").charAt(0).toUpperCase()}
          </div>
          {participant.audioMuted ? (
            <span className="tile-mic-badge tile-mic-badge--off tile-mic-badge--float">
              <MicOff size={12} />
            </span>
          ) : (
            <span className="tile-mic-badge tile-mic-badge--on tile-mic-badge--float">
              <Mic size={12} />
            </span>
          )}
          <div className="tile-overlay tile-overlay--blank">
            <div className="tile-overlay__left">
              <span className="tile-overlay__name">
                {participant.name || "Guest"}
                {isCurrentUser ? " (You)" : ""}
              </span>
            </div>
            <div className="signal-badge" title={`Signal: ${signalLevel}/4`}>
              <span
                className={`signal-bar${signalLevel >= 1 ? " active" : ""}`}
              />
              <span
                className={`signal-bar${signalLevel >= 2 ? " active" : ""}`}
              />
              <span
                className={`signal-bar${signalLevel >= 3 ? " active" : ""}`}
              />
              <span
                className={`signal-bar${signalLevel >= 4 ? " active" : ""}`}
              />
            </div>
          </div>

          {currentRole === "teacher" &&
            !participant.isLocal &&
            participant.role !== "teacher" && (
              <button
                className="tile-kick-btn"
                onClick={() => onKick?.(participant.id)}
                title="Remove participant"
              >
                <UserX size={15} />
              </button>
            )}

          {canPin && (
            <button
              className={`tile-pin-btn${isPinned ? " tile-pin-btn--active" : ""}`}
              onClick={() => onTogglePin?.(participant.id)}
              title={isPinned ? "Unpin" : "Pin"}
            >
              {isPinned ? <PinOff size={14} /> : <Pin size={14} />}
            </button>
          )}
        </div>
      )}

      <audio ref={audioRef} autoPlay muted={isCurrentUser} />

      {/* ── Status icon row ── */}
      <div className="tile-status-row">
        <span
          className={
            participant.audioMuted
              ? "status-badge status-badge--off"
              : "status-badge status-badge--on"
          }
        >
          {participant.audioMuted ? <MicOff size={11} /> : <Mic size={11} />}
          {participant.audioMuted ? "Mic off" : "Mic on"}
        </span>
        <span
          className={
            participant.videoMuted
              ? "status-badge status-badge--off"
              : "status-badge status-badge--on"
          }
        >
          {participant.videoMuted ? (
            <VideoOff size={11} />
          ) : (
            <Video size={11} />
          )}
          {participant.videoMuted ? "Cam off" : "Cam on"}
        </span>
        <span
          className={
            participant.isScreenSharing
              ? "status-badge status-badge--on"
              : "status-badge status-badge--neutral"
          }
        >
          {participant.isScreenSharing ? (
            <Monitor size={11} />
          ) : (
            <MonitorOff size={11} />
          )}
          {participant.isScreenSharing ? "Sharing" : "No screen"}
        </span>
      </div>

      {/* ── Network stats — collapsible ── */}
      <div
        className="tile-network-header"
        onClick={() => setShowStats(!showStats)}
      >
        <Wifi size={12} />
        <span>Network stats</span>
        <span className="tile-network-toggle">{showStats ? "▲" : "▼"}</span>
        {pingMs !== null && (
          <span className={`ping-inline ${getPingClass()}`}>{pingMs} ms</span>
        )}
      </div>

      {showStats && (
        <div className="tile-network">
          <span>IP: {participant.ip || "unknown"}</span>
          <span className={getPingClass()}>
            Ping: {pingMs !== null ? `${pingMs} ms` : "--"}
          </span>
          <span
            className={
              lossPercent !== null && lossPercent >= 8 ? "ping--bad" : ""
            }
          >
            Loss: {lossPercent !== null ? `${lossPercent}%` : "--"}
          </span>
          <span>
            Packets:{" "}
            {typeof participant.totalPackets === "number"
              ? participant.totalPackets
              : "--"}
          </span>
          <span>
            Lost:{" "}
            {typeof participant.lostPackets === "number"
              ? participant.lostPackets
              : "--"}
          </span>
        </div>
      )}
    </div>
  );
};

export default ParticipantTile;
