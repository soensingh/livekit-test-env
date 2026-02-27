import React, { useState } from "react";
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
  onToggleMic,
  onToggleCam,
  onToggleScreenShare,
  mirrorLocalVideo,
  onFlipLocalVideo,
  qualityMode,
  cameraDevices,
  selectedCameraId,
  onSelectCamera,
  onSwitchCamera,
  onKickParticipant,
  messages,
  chatInput,
  setChatInput,
  onSendChat,
}) => {
  const [chatOpen, setChatOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const [cameraMenuOpen, setCameraMenuOpen] = useState(false);

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="meet-shell">
      {/* ── Top Bar ── */}
      <header className="meet-topbar">
        <div className="topbar-brand">
          <div className="topbar-logo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M21 7l-7 5-7-5V5l7 5 7-5v2z" fill="#00BCD4" />
              <path
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7"
                stroke="#00BCD4"
                strokeWidth="1.5"
                fill="none"
              />
            </svg>
          </div>
          <div>
            <span className="topbar-title">Live Classroom</span>
            <span className="topbar-meta">
              {role === "teacher" ? "Teacher" : "Student"}
              &nbsp;|&nbsp;
              <span
                className={`status-dot ${status === "connected" ? "status-connected" : "status-waiting"}`}
              >
                {status}
              </span>
              &nbsp;|&nbsp;{qualityMode}
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
              <Users size={14} />
              <span className="room-chip-id">{roomId}</span>
              {copied ? (
                <Check size={14} className="copy-check" />
              ) : (
                <Copy size={14} />
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
      <div className={`meet-main${chatOpen ? "" : " chat-closed"}`}>
        {/* ── Video Stage ── */}
        <section className="video-stage">
          <div
            className={`video-grid participants-${Math.min(participants.length, 6)}`}
          >
            {participants.length === 0 ? (
              <div className="video-empty-state">
                <VideoOff size={48} strokeWidth={1.5} />
                <p>No participants yet</p>
              </div>
            ) : (
              participants.map((participant) => (
                <ParticipantTile
                  key={participant.id}
                  participant={participant}
                  currentRole={role}
                  onKick={onKickParticipant}
                  mirrorLocalVideo={mirrorLocalVideo}
                />
              ))
            )}
          </div>

          {/* ── Controls Bar ── */}
          {roomId && (
            <div className="meet-controls">
              <div className="controls-left">
                <span className="meet-time">
                  {new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {roomId && <span className="meet-room-label">{roomId}</span>}
              </div>

              <div className="controls-center">
                {/* Mic */}
                <div className="ctrl-group">
                  <button
                    className={`ctrl-btn${micEnabled ? "" : " ctrl-btn--off"}`}
                    onClick={onToggleMic}
                    title={micEnabled ? "Mute" : "Unmute"}
                  >
                    {micEnabled ? <Mic size={22} /> : <MicOff size={22} />}
                  </button>
                  <span className="ctrl-label">
                    {micEnabled ? "Mute" : "Unmute"}
                  </span>
                </div>

                {/* Camera */}
                <div className="ctrl-group">
                  <button
                    className={`ctrl-btn${camEnabled ? "" : " ctrl-btn--off"}`}
                    onClick={onToggleCam}
                    title={camEnabled ? "Stop video" : "Start video"}
                  >
                    {camEnabled ? <Video size={22} /> : <VideoOff size={22} />}
                  </button>
                  <span className="ctrl-label">
                    {camEnabled ? "Stop video" : "Start video"}
                  </span>
                </div>

                {/* Screen Share */}
                <div className="ctrl-group">
                  <button
                    className={`ctrl-btn${screenSharing ? " ctrl-btn--share" : ""}`}
                    onClick={onToggleScreenShare}
                    title={screenSharing ? "Stop sharing" : "Present now"}
                  >
                    {screenSharing ? (
                      <ScreenShareOff size={22} />
                    ) : (
                      <ScreenShare size={22} />
                    )}
                  </button>
                  <span className="ctrl-label">
                    {screenSharing ? "Stop share" : "Present"}
                  </span>
                </div>

                {/* Flip */}
                <div className="ctrl-group">
                  <button
                    className="ctrl-btn"
                    onClick={onFlipLocalVideo}
                    title={mirrorLocalVideo ? "Unflip video" : "Flip video"}
                  >
                    {mirrorLocalVideo ? (
                      <FlipHorizontal2 size={22} />
                    ) : (
                      <FlipHorizontal size={22} />
                    )}
                  </button>
                  <span className="ctrl-label">
                    {mirrorLocalVideo ? "Unflip" : "Flip"}
                  </span>
                </div>

                {/* Camera switcher */}
                <div className="ctrl-group ctrl-group--relative">
                  <button
                    className="ctrl-btn"
                    onClick={() => {
                      onSwitchCamera();
                      setCameraMenuOpen(!cameraMenuOpen);
                    }}
                    title="Switch camera"
                  >
                    <SwitchCamera size={22} />
                  </button>
                  <span className="ctrl-label">Camera</span>
                  {cameraMenuOpen && cameraDevices.length > 0 && (
                    <div className="camera-dropdown">
                      <p className="camera-dropdown__header">Select camera</p>
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

                {/* More */}
                <div className="ctrl-group">
                  <button className="ctrl-btn" title="More options">
                    <MoreVertical size={22} />
                  </button>
                  <span className="ctrl-label">More</span>
                </div>

                {/* Leave */}
                <button
                  className="ctrl-btn ctrl-btn--leave"
                  onClick={onLeaveRoom}
                  title="Leave call"
                >
                  <PhoneOff size={20} />
                </button>
              </div>

              <div className="controls-right">
                <button
                  className={`ctrl-btn${chatOpen ? " ctrl-btn--active-chat" : ""}`}
                  onClick={() => setChatOpen(!chatOpen)}
                  title="In-call messages"
                >
                  <MessageSquare size={22} />
                </button>
              </div>
            </div>
          )}
        </section>

        {/* ── Chat Panel ── */}
        {chatOpen && (
          <aside className="chat-panel">
            <div className="chat-header">
              <span className="chat-title">In-call messages</span>
              <button className="chat-close" onClick={() => setChatOpen(false)}>
                ✕
              </button>
            </div>

            <div className="chat-messages">
              {messages.length === 0 ? (
                <div className="chat-empty">
                  <MessageSquare size={32} strokeWidth={1.5} />
                  <p>Messages can only be seen by people in the call</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className="chat-message">
                    <span className="chat-message__sender">{msg.sender}</span>
                    <span className="chat-message__text">{msg.text}</span>
                  </div>
                ))
              )}
            </div>

            <div className="chat-input-row">
              <input
                className="input chat-input"
                placeholder="Send a message to everyone"
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
                <Send size={18} />
              </button>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default ClassroomPage;
