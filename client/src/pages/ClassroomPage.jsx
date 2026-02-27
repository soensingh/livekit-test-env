import React, { useEffect, useRef, useState } from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  ScreenShare,
  ScreenShareOff,
  FlipHorizontal,
  FlipHorizontal2,
  SwitchCamera,
  PhoneOff,
  MessageSquare,
  Send,
  Users,
  Copy,
  Check,
  MoreVertical,
} from "lucide-react";
import ParticipantTile from "../components/ParticipantTile";

const ClassroomPage = ({
  role,
  roomId,
  status,
  roomInput,
  setRoomInput,
  onCreateRoom,
  onJoinRoom,
  onLeaveRoom,
  onEndRoom,
  participants,
  micEnabled,
  camEnabled,
  screenSharing,
  canScreenShare,
  onToggleMic,
  onToggleCam,
  onToggleScreenShare,
  mirrorLocalVideo,
  onFlipLocalVideo,
  qualityMode,
  connectionDiagnostics,
  cameraDevices,
  selectedCameraId,
  onSelectCamera,
  onSwitchCamera,
  onKickParticipant,
  messages,
  chatInput,
  setChatInput,
  onSendChat,
  currentUserId, // pass current user's id/name so we can detect "mine" vs "theirs"
}) => {
  const [chatOpen, setChatOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const [cameraMenuOpen, setCameraMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [pinnedParticipantId, setPinnedParticipantId] = useState(null);
  const moreMenuRef = useRef(null);

  const visibleParticipants = participants || [];
  const localParticipantId =
    currentUserId ||
    visibleParticipants.find((participant) => participant.isLocal)?.id ||
    null;
  const pinnedParticipant = visibleParticipants.find(
    (participant) => participant.id === pinnedParticipantId
  );
  const sideParticipants = visibleParticipants.filter(
    (participant) => participant.id !== pinnedParticipantId
  );

  useEffect(() => {
    if (
      pinnedParticipantId &&
      !visibleParticipants.some(
        (participant) => participant.id === pinnedParticipantId
      )
    ) {
      setPinnedParticipantId(null);
    }
  }, [pinnedParticipantId, visibleParticipants]);

  const togglePinParticipant = (participantId) => {
    setPinnedParticipantId((currentPinnedId) =>
      currentPinnedId === participantId ? null : participantId
    );
  };

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (!moreMenuOpen) return;
    const handlePointerDown = (event) => {
      if (moreMenuRef.current?.contains(event.target)) return;
      setMoreMenuOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [moreMenuOpen]);

  return (
    <div className="meet-shell">
      {/* ── Top Bar ── */}
      <header className="meet-topbar">
        <div className="topbar-brand">
          <div className="topbar-logo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M21 7l-7 5-7-5V5l7 5 7-5v2z" fill="#4f8ef7" />
              <path
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7"
                stroke="#4f8ef7"
                strokeWidth="1.5"
                fill="none"
              />
            </svg>
          </div>
          <div>
            <span className="topbar-title">Live Classroom</span>
            <span className="topbar-meta">
              {role === "teacher" ? "Teacher" : "Student"}
              &nbsp;·&nbsp;
              <span
                className={
                  status === "connected" ? "status-connected" : "status-waiting"
                }
              >
                {status}
              </span>
              &nbsp;·&nbsp;{qualityMode}
            </span>
          </div>
        </div>

        <div className="topbar-right">
          {roomId && (
            <button
              className="room-chip"
              onClick={handleCopyRoomId}
              title="Copy room code"
            >
              <Users size={13} />
              <span className="room-chip-id">{roomId}</span>
              {copied ? (
                <Check size={13} className="copy-check" />
              ) : (
                <Copy size={13} />
              )}
            </button>
          )}

          {!roomId && role === "teacher" && (
            <button className="button" onClick={onCreateRoom}>
              Start Meeting
            </button>
          )}

          {!roomId && role === "student" && (
            <div className="join-inline">
              <input
                className="input"
                placeholder="Enter room code"
                value={roomInput}
                onChange={(e) => setRoomInput(e.target.value)}
              />
              <button className="button" onClick={onJoinRoom}>
                Join
              </button>
            </div>
          )}

          {roomId && role === "teacher" && (
            <button className="button danger" onClick={onEndRoom}>
              End for all
            </button>
          )}
        </div>
      </header>

      {/* ── Main Body ── */}
      <div className={`meet-main${chatOpen ? " chat-open" : ""}`}>
        {/* ── Video Stage ── */}
        <section className="meet-stage">
          <div className="video-grid-wrap">
            {visibleParticipants.length === 0 ? (
              <div className="video-grid p1">
                <div className="video-empty-state">
                  <VideoOff size={44} strokeWidth={1.2} />
                  <p>Waiting for participants…</p>
                </div>
              </div>
            ) : pinnedParticipant ? (
              <div
                className={`video-grid video-grid--pinned${sideParticipants.length === 0 ? " video-grid--pinned-solo" : ""}`}
              >
                <div className="video-grid__pinned-main">
                  <ParticipantTile
                    participant={pinnedParticipant}
                    currentRole={role}
                    onKick={onKickParticipant}
                    mirrorLocalVideo={mirrorLocalVideo}
                    isCurrentUser={pinnedParticipant.id === localParticipantId}
                    isPinned
                    canPin
                    onTogglePin={togglePinParticipant}
                  />
                </div>
                {sideParticipants.length > 0 && (
                  <div className="video-grid__pinned-strip">
                    {sideParticipants.map((participant) => (
                      <ParticipantTile
                        key={participant.id}
                        participant={participant}
                        currentRole={role}
                        onKick={onKickParticipant}
                        mirrorLocalVideo={mirrorLocalVideo}
                        isCurrentUser={participant.id === localParticipantId}
                        canPin
                        onTogglePin={togglePinParticipant}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div
                className={`video-grid p${Math.min(Math.max(visibleParticipants.length, 1), 9)}`}
              >
                {visibleParticipants.map((participant) => (
                  <ParticipantTile
                    key={participant.id}
                    participant={participant}
                    currentRole={role}
                    onKick={onKickParticipant}
                    mirrorLocalVideo={mirrorLocalVideo}
                    isCurrentUser={participant.id === localParticipantId}
                    canPin
                    onTogglePin={togglePinParticipant}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── Controls Bar ── */}
          {roomId && (
            <div className="meet-controls">
              {/* Left — time + room label */}
              <div className="controls-left">
                <span className="meet-time">
                  {new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {roomId && <span className="meet-room-label">{roomId}</span>}
                {connectionDiagnostics && (
                  <div className={`conn-badge conn-badge--${connectionDiagnostics.route}`}>
                    <span className="conn-badge__route">{connectionDiagnostics.route}</span>
                    <span className="conn-badge__sep">•</span>
                    <span className="conn-badge__candidate">{connectionDiagnostics.candidate}</span>
                    <span className="conn-badge__sep">•</span>
                    <span className="conn-badge__bitrate">
                      {typeof connectionDiagnostics.bitrateKbps === "number"
                        ? `${connectionDiagnostics.bitrateKbps} kbps`
                        : "-- kbps"}
                    </span>
                  </div>
                )}
              </div>

              {/* Center — action buttons */}
              <div className="controls-center">
                <div className="ctrl-group">
                  <button
                    className={`ctrl-btn${micEnabled ? "" : " ctrl-btn--off"}`}
                    onClick={onToggleMic}
                    title={micEnabled ? "Mute" : "Unmute"}
                  >
                    {micEnabled ? <Mic size={20} /> : <MicOff size={20} />}
                  </button>
                  <span className="ctrl-label">
                    {micEnabled ? "Mute" : "Unmute"}
                  </span>
                </div>

                <div className="ctrl-group">
                  <button
                    className={`ctrl-btn${camEnabled ? "" : " ctrl-btn--off"}`}
                    onClick={onToggleCam}
                    title={camEnabled ? "Stop video" : "Start video"}
                  >
                    {camEnabled ? <Video size={20} /> : <VideoOff size={20} />}
                  </button>
                  <span className="ctrl-label">
                    {camEnabled ? "Stop" : "Start"}
                  </span>
                </div>

                <div className="ctrl-group">
                  <button
                    className={`ctrl-btn${screenSharing ? " ctrl-btn--share" : ""}${canScreenShare ? "" : " ctrl-btn--disabled"}`}
                    onClick={onToggleScreenShare}
                    title={canScreenShare ? (screenSharing ? "Stop sharing" : "Present now") : "Screen share not supported on this browser/device"}
                    disabled={!canScreenShare}
                  >
                    {screenSharing ? (
                      <ScreenShareOff size={20} />
                    ) : (
                      <ScreenShare size={20} />
                    )}
                  </button>
                  <span className="ctrl-label">
                    {screenSharing ? "Stop" : "Present"}
                  </span>
                </div>

                <div className="ctrl-group">
                  <button
                    className={`ctrl-btn${mirrorLocalVideo ? " ctrl-btn--flip-active" : ""}`}
                    onClick={onFlipLocalVideo}
                    title={mirrorLocalVideo ? "Unflip" : "Flip video"}
                  >
                    {mirrorLocalVideo ? (
                      <FlipHorizontal2 size={20} />
                    ) : (
                      <FlipHorizontal size={20} />
                    )}
                  </button>
                  <span className="ctrl-label">
                    {mirrorLocalVideo ? "Unflip" : "Flip"}
                  </span>
                </div>

                <div className="ctrl-group ctrl-group--relative">
                  <button
                    className="ctrl-btn"
                    onClick={() => {
                      setMoreMenuOpen(false);
                      setCameraMenuOpen(!cameraMenuOpen);
                    }}
                    title="Camera options"
                  >
                    <SwitchCamera size={20} />
                  </button>
                  <span className="ctrl-label">Camera</span>
                  {cameraMenuOpen && cameraDevices.length > 0 && (
                    <div className="camera-dropdown">
                      <p className="camera-dropdown__header">Select camera</p>
                      <div
                        className="camera-dropdown__item"
                        onClick={() => {
                          onSwitchCamera();
                          setCameraMenuOpen(false);
                        }}
                      >
                        Switch to next camera
                      </div>
                      <div
                        className="camera-dropdown__item"
                        onClick={() => {
                          onSelectCamera("");
                          setCameraMenuOpen(false);
                        }}
                      >
                        Default camera
                      </div>
                      {cameraDevices.map((device, idx) => (
                        <div
                          key={device.deviceId}
                          className={`camera-dropdown__item${selectedCameraId === device.deviceId ? " camera-dropdown__item--active" : ""}`}
                          onClick={() => {
                            onSelectCamera(device.deviceId);
                            setCameraMenuOpen(false);
                          }}
                        >
                          {device.label || `Camera ${idx + 1}`}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="ctrl-group ctrl-group--relative" ref={moreMenuRef}>
                  <button
                    className={`ctrl-btn${moreMenuOpen ? " ctrl-btn--active-chat" : ""}`}
                    title="More options"
                    onClick={() => {
                      setCameraMenuOpen(false);
                      setMoreMenuOpen(!moreMenuOpen);
                    }}
                  >
                    <MoreVertical size={20} />
                  </button>
                  <span className="ctrl-label">More</span>
                  {moreMenuOpen && (
                    <div className="more-dropdown">
                      <p className="camera-dropdown__header">More options</p>
                      <div className="camera-dropdown__item" onClick={() => setChatOpen((prev) => !prev)}>
                        {chatOpen ? "Hide chat" : "Show chat"}
                      </div>
                      <div
                        className="camera-dropdown__item"
                        onClick={() => {
                          onFlipLocalVideo();
                          setMoreMenuOpen(false);
                        }}
                      >
                        {mirrorLocalVideo ? "Unflip self view" : "Flip self view"}
                      </div>
                      <div
                        className="camera-dropdown__item"
                        onClick={() => {
                          setPinnedParticipantId(null);
                          setMoreMenuOpen(false);
                        }}
                      >
                        Reset pin layout
                      </div>
                    </div>
                  )}
                </div>

                <button
                  className="ctrl-btn ctrl-btn--leave"
                  onClick={onLeaveRoom}
                  title="Leave call"
                >
                  <PhoneOff size={18} />
                </button>
              </div>

              {/* Right — chat toggle */}
              <div className="controls-right">
                <button
                  className={`ctrl-btn${chatOpen ? " ctrl-btn--active-chat" : ""}`}
                  onClick={() => setChatOpen(!chatOpen)}
                  title="In-call messages"
                >
                  <MessageSquare size={20} />
                </button>
              </div>
            </div>
          )}
        </section>

        {/* ── Chat Panel ── */}
        {chatOpen && (
          <aside className="chat-panel open">
            <div className="chat-header">
              <span className="chat-title">Messages</span>
              <button className="chat-close" onClick={() => setChatOpen(false)}>
                ✕
              </button>
            </div>

            <div className="chat-messages">
              {messages.length === 0 ? (
                <div className="chat-empty">
                  <MessageSquare size={28} strokeWidth={1.2} />
                  <p>
                    No messages yet.
                    <br />
                    Say something!
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine =
                    msg.senderId === currentUserId ||
                    msg.sender === currentUserId;
                  return (
                    <div
                      key={msg.id}
                      className={`chat-bubble-wrap ${isMine ? "chat-bubble-wrap--mine" : "chat-bubble-wrap--theirs"}`}
                    >
                      {!isMine && (
                        <span className="chat-bubble__sender">
                          {msg.sender}
                        </span>
                      )}
                      <div
                        className={`chat-bubble ${isMine ? "chat-bubble--mine" : "chat-bubble--theirs"}`}
                      >
                        <span className="chat-bubble__text">{msg.text}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="chat-input-row">
              <input
                className="chat-input"
                placeholder="Message everyone…"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onSendChat();
                }}
              />
              <button
                className={`chat-send-btn${chatInput.trim() ? " chat-send-btn--active" : ""}`}
                onClick={onSendChat}
                title="Send"
              >
                <Send size={16} />
              </button>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default ClassroomPage;
