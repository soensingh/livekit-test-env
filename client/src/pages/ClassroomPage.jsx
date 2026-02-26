import React from 'react';
import ParticipantTile from '../components/ParticipantTile';

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
  onToggleMic,
  onToggleCam,
  cameraDevices,
  selectedCameraId,
  onSelectCamera,
  onSwitchCamera,
  messages,
  chatInput,
  setChatInput,
  onSendChat,
}) => {
  return (
    <div className="meet-shell">
      <header className="meet-topbar">
        <div>
          <h2>Live Classroom</h2>
          <p className="muted">Role: {role} · Status: {status}</p>
        </div>
        <div className="topbar-right">
          {roomId && <div className="pill">Room ID: {roomId}</div>}
          {!roomId && role === 'teacher' && (
            <button className="button" onClick={onCreateRoom}>
              Start Meeting
            </button>
          )}
          {!roomId && role === 'student' && (
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
          {roomId && role === 'teacher' && (
            <button className="button danger" onClick={onEndRoom}>
              End for all
            </button>
          )}
        </div>
      </header>

      <div className="meet-main">
        <section className="video-stage">
          <div className="video-grid">
            {participants.length === 0 ? (
              <div className="video placeholder">No participants yet</div>
            ) : (
              participants.map((participant) => (
                <ParticipantTile key={participant.id} participant={participant} />
              ))
            )}
          </div>

          {roomId && (
            <div className="meet-controls">
              <button className="button control" onClick={onToggleMic}>
                {micEnabled ? 'Mute' : 'Unmute'}
              </button>
              <button className="button control" onClick={onToggleCam}>
                {camEnabled ? 'Stop video' : 'Start video'}
              </button>
              <button className="button control" onClick={onSwitchCamera}>
                Switch camera
              </button>
              <select
                className="input camera-select"
                value={selectedCameraId}
                onChange={(e) => onSelectCamera(e.target.value)}
              >
                <option value="">Default camera</option>
                {cameraDevices.map((device, idx) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Camera ${idx + 1}`}
                  </option>
                ))}
              </select>
              <button className="button secondary" onClick={onLeaveRoom}>
                Leave
              </button>
            </div>
          )}
        </section>

        <aside className="chat-panel">
          <h3>In-meeting chat</h3>
          <div className="chat-messages">
            {messages.length === 0 ? (
              <p className="muted">No messages yet.</p>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="chat-message">
                  <strong>{msg.sender}:</strong> {msg.text}
                </div>
              ))
            )}
          </div>
          <div className="row chat-input-row">
            <input
              className="input"
              placeholder="Type a message"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSendChat();
              }}
            />
            <button className="button" onClick={onSendChat}>
              Send
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ClassroomPage;
