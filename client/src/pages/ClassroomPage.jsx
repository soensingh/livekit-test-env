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
  messages,
  chatInput,
  setChatInput,
  onSendChat,
}) => {
  return (
    <div className="page">
      <div className="card wide">
        <div className="row space">
          <div>
            <h2>Classroom</h2>
            <p className="muted">Role: {role}</p>
            <p className="muted">Status: {status}</p>
          </div>
          {roomId && <div className="pill">Room ID: {roomId}</div>}
        </div>

        {role === 'teacher' ? (
          <div className="row">
            <button className="button" onClick={onCreateRoom}>
              Create Room
            </button>
            {roomId && (
              <button className="button secondary" onClick={onEndRoom}>
                End Room
              </button>
            )}
          </div>
        ) : (
          <div className="row">
            <input
              className="input"
              placeholder="Room ID"
              value={roomInput}
              onChange={(e) => setRoomInput(e.target.value)}
            />
            <button className="button" onClick={onJoinRoom}>
              Join Room
            </button>
          </div>
        )}

        {roomId && (
          <div className="row">
            <button className="button secondary" onClick={onLeaveRoom}>
              Leave Room
            </button>
            <button className="button" onClick={onToggleMic}>
              {micEnabled ? 'Mute Mic' : 'Unmute Mic'}
            </button>
            <button className="button" onClick={onToggleCam}>
              {camEnabled ? 'Camera Off' : 'Camera On'}
            </button>
          </div>
        )}

        <div className="content-grid">
          <div className="video-grid">
            {participants.length === 0 ? (
              <div className="video placeholder">No participants yet</div>
            ) : (
              participants.map((participant) => (
                <ParticipantTile key={participant.id} participant={participant} />
              ))
            )}
          </div>

          <div className="chat-panel">
            <h3>Room Chat</h3>
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
            <div className="row">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassroomPage;
