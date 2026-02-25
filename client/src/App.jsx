import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { Room } from 'livekit-client';
import HomePage from './pages/HomePage';
import ClassroomPage from './pages/ClassroomPage';
import AdminPage from './pages/AdminPage';
import './App.css';

const SIGNALING_URL = import.meta.env.VITE_SIGNALING_URL || window.location.origin;

const SFU_URL = import.meta.env.VITE_SFU_URL || '';

function App() {
  const [role, setRole] = useState(null);
  const [name, setName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [roomInput, setRoomInput] = useState('');
  const [status, setStatus] = useState('idle');
  const [participants, setParticipants] = useState([]);
  const [micEnabled, setMicEnabled] = useState(true);
  const [camEnabled, setCamEnabled] = useState(true);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [adminRooms, setAdminRooms] = useState([]);

  const socketRef = useRef(null);
  const roomRef = useRef(null);
  const localIdentityRef = useRef('');

  const appendMessage = (entry) => {
    setMessages((prev) => [...prev, entry]);
  };

  const upsertParticipant = (entry) => {
    setParticipants((prev) => {
      const index = prev.findIndex((item) => item.id === entry.id);
      if (index === -1) {
        return [...prev, entry];
      }
      const updated = [...prev];
      updated[index] = { ...updated[index], ...entry };
      return updated;
    });
  };

  const removeParticipant = (id) => {
    setParticipants((prev) => prev.filter((item) => item.id !== id));
  };

  const updateParticipantTrack = (participant, track, kind, publication) => {
    const id = participant.identity || participant.sid;
    if (!id) return;
    const nameValue = participant.name || participant.identity || 'Guest';
    if (kind === 'video') {
      upsertParticipant({
        id,
        name: nameValue,
        videoTrack: track,
        videoMuted: publication?.isMuted ?? false,
      });
      return;
    }
    if (kind === 'audio') {
      upsertParticipant({
        id,
        name: nameValue,
        audioTrack: track,
        audioMuted: publication?.isMuted ?? false,
      });
    }
  };

  const bindParticipantEvents = (participant) => {
    participant.on('trackMuted', (publication) => {
      if (!publication) return;
      const id = participant.identity || participant.sid;
      if (!id) return;
      if (publication.kind === 'audio') {
        upsertParticipant({ id, audioMuted: true });
      }
      if (publication.kind === 'video') {
        upsertParticipant({ id, videoMuted: true });
      }
    });

    participant.on('trackUnmuted', (publication) => {
      if (!publication) return;
      const id = participant.identity || participant.sid;
      if (!id) return;
      if (publication.kind === 'audio') {
        upsertParticipant({ id, audioMuted: false });
      }
      if (publication.kind === 'video') {
        upsertParticipant({ id, videoMuted: false });
      }
    });
  };

  useEffect(() => {
    if (!role || role === 'admin') return;
    const socket = io(SIGNALING_URL, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('role:selected', { role, name });
    });

    socket.on('room:end', () => {
      stopSession();
      setStatus('ended');
      setRoomId('');
    });

    socket.on('chat:message', (payload = {}) => {
      const { id, text, sender, timestamp } = payload;
      if (!text) return;
      appendMessage({
        id: id || `${Date.now()}`,
        text,
        sender: sender || 'Guest',
        timestamp: timestamp || new Date().toISOString(),
      });
    });

    socket.on('ping:update', (payload = {}) => {
      const { identity, pingMs } = payload;
      if (!identity || typeof pingMs !== 'number') return;
      upsertParticipant({ id: identity, pingMs });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [role]);

  useEffect(() => {
    if (role !== 'admin') return;
    let active = true;
    const loadRooms = async () => {
      try {
        const response = await fetch(`${SIGNALING_URL}/api/admin/rooms`);
        const data = await response.json();
        if (active) {
          setAdminRooms(Array.isArray(data.rooms) ? data.rooms : []);
        }
      } catch {
        if (active) setAdminRooms([]);
      }
    };
    loadRooms();
    const interval = setInterval(loadRooms, 3000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [role]);

  useEffect(() => {
    const socket = socketRef.current;
    if (socket && role) {
      socket.emit('role:selected', { role, name });
    }
  }, [name, role]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !roomId || !localIdentityRef.current) return;
    const interval = setInterval(() => {
      const start = performance.now();
      socket.timeout(2000).emit('ping:echo', { roomId }, (err) => {
        if (err) return;
        const pingMs = Math.round(performance.now() - start);
        const identity = localIdentityRef.current;
        if (!identity) return;
        socket.emit('ping:report', { roomId, identity, pingMs });
        upsertParticipant({ id: identity, pingMs });
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [roomId]);

  const startSession = async (activeRoomId) => {
    const socket = socketRef.current;
    if (!socket || !activeRoomId) return;

    const identity = `${role}-${Date.now()}`;
    localIdentityRef.current = identity;

    // WebRTC: LiveKit (SFU) handles signaling and media routing.
    // TURN/STUN usage is handled by the SFU configuration.
    const response = await fetch(`${SIGNALING_URL}/api/sfu/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId: activeRoomId,
        identity,
        name,
      }),
    });

    const data = await response.json();
    const rawToken = typeof data === 'string' ? data : data?.token;
    const tokenValue =
      typeof rawToken === 'string'
        ? rawToken
        : rawToken?.token || rawToken?.jwt || '';

    if (!tokenValue || !SFU_URL) {
      setStatus('error');
      return;
    }

    const room = new Room();
    roomRef.current = room;

    room.on('participantConnected', (participant) => {
      const id = participant.identity || participant.sid;
      if (!id) return;
      upsertParticipant({
        id,
        name: participant.name || participant.identity || 'Guest',
        isLocal: false,
      });
      bindParticipantEvents(participant);
    });

    room.on('participantDisconnected', (participant) => {
      const id = participant.identity || participant.sid;
      if (!id) return;
      removeParticipant(id);
    });

    room.on('trackSubscribed', (track, publication, participant) => {
      updateParticipantTrack(participant, track, track.kind, publication);
    });

    room.on('trackUnsubscribed', (track, _publication, participant) => {
      const id = participant.identity || participant.sid;
      if (!id) return;
      if (track.kind === 'video') {
        upsertParticipant({ id, videoTrack: null, videoMuted: true });
      }
      if (track.kind === 'audio') {
        upsertParticipant({ id, audioTrack: null, audioMuted: true });
      }
    });

    await room.connect(SFU_URL, tokenValue);
    const localId = room.localParticipant.identity || room.localParticipant.sid || identity;
    upsertParticipant({
      id: localId,
      name: room.localParticipant.name || name || 'You',
      isLocal: true,
      videoTrack: null,
      audioTrack: null,
      audioMuted: true,
      videoMuted: true,
    });

    try {
      await room.localParticipant.enableCameraAndMicrophone();
    } catch {
      setStatus('media-blocked');
    }

    bindParticipantEvents(room.localParticipant);

    room.on('localTrackPublished', (publication) => {
      const track = publication?.track;
      if (!track) return;
      const localId = room.localParticipant.identity || room.localParticipant.sid || 'local';
      if (track.kind === 'video') {
        upsertParticipant({ id: localId, videoTrack: track, videoMuted: publication.isMuted });
      }
      if (track.kind === 'audio') {
        upsertParticipant({ id: localId, audioTrack: track, audioMuted: publication.isMuted });
      }
    });

    room.on('localTrackUnpublished', (publication) => {
      const localId = room.localParticipant.identity || room.localParticipant.sid || 'local';
      if (publication.kind === 'video') {
        upsertParticipant({ id: localId, videoTrack: null, videoMuted: true });
      }
      if (publication.kind === 'audio') {
        upsertParticipant({ id: localId, audioTrack: null, audioMuted: true });
      }
    });

    const remoteList = room.participants?.values
      ? Array.from(room.participants.values())
      : Array.isArray(room.participants)
        ? room.participants
        : [];

    remoteList.forEach((participant) => {
      const id = participant.identity || participant.sid;
      if (!id) return;
      upsertParticipant({
        id,
        name: participant.name || participant.identity || 'Guest',
        isLocal: false,
      });
      bindParticipantEvents(participant);
    });

    const localVideo = room.localParticipant.getTrackPublication('camera')?.track || null;
    const localAudio = room.localParticipant.getTrackPublication('microphone')?.track || null;
    upsertParticipant({
      id: localId,
      name: room.localParticipant.name || name || 'You',
      isLocal: true,
      videoTrack: localVideo,
      audioTrack: localAudio,
      audioMuted: !room.localParticipant.isMicrophoneEnabled,
      videoMuted: !room.localParticipant.isCameraEnabled,
    });

    setMicEnabled(room.localParticipant.isMicrophoneEnabled);
    setCamEnabled(room.localParticipant.isCameraEnabled);

  };

  const stopSession = () => {
    if (roomRef.current) {
      roomRef.current.disconnect();
      roomRef.current = null;
    }
    setParticipants([]);
    setMessages([]);
    localIdentityRef.current = '';
  };

  const handleToggleMic = async () => {
    if (!roomRef.current) return;
    const next = !micEnabled;
    await roomRef.current.localParticipant.setMicrophoneEnabled(next);
    setMicEnabled(next);
    const localId = roomRef.current.localParticipant.identity || roomRef.current.localParticipant.sid || 'local';
    upsertParticipant({ id: localId, audioMuted: !next });
  };

  const handleToggleCam = async () => {
    if (!roomRef.current) return;
    const next = !camEnabled;
    await roomRef.current.localParticipant.setCameraEnabled(next);
    setCamEnabled(next);
    const localId = roomRef.current.localParticipant.identity || roomRef.current.localParticipant.sid || 'local';
    upsertParticipant({ id: localId, videoMuted: !next });
  };

  const handleSendChat = () => {
    if (!chatInput.trim() || !roomId) return;
    const socket = socketRef.current;
    const payload = {
      id: `${Date.now()}`,
      roomId,
      text: chatInput.trim(),
      sender: name || 'Guest',
      timestamp: new Date().toISOString(),
    };
    socket?.emit('chat:message', payload);
    setChatInput('');
  };

  const handleCreateRoom = () => {
    const socket = socketRef.current;
    if (!socket) return;
    setStatus('connecting');
    socket.emit('room:create', { name }, async (response) => {
      if (!response?.ok) {
        setStatus('error');
        return;
      }
      setRoomId(response.roomId);
      setStatus('live');
      await startSession(response.roomId);
    });
  };

  const handleJoinRoom = () => {
    const socket = socketRef.current;
    if (!socket || !roomInput) return;
    setStatus('connecting');
    socket.emit('room:join', { roomId: roomInput, name }, async (response) => {
      if (!response?.ok) {
        setStatus('error');
        return;
      }
      setRoomId(response.roomId);
      setStatus('live');
      await startSession(response.roomId);
    });
  };

  const handleLeaveRoom = () => {
    const socket = socketRef.current;
    if (socket && roomId) {
      socket.emit('room:leave', { roomId });
    }
    stopSession();
    setRoomId('');
    setStatus('idle');
  };

  const handleEndRoom = () => {
    const socket = socketRef.current;
    if (socket && roomId) {
      socket.emit('room:end', { roomId });
    }
    stopSession();
    setRoomId('');
    setStatus('ended');
  };

  if (!role) {
    return <HomePage name={name} setName={setName} onSelectRole={setRole} />;
  }

  if (role === 'admin') {
    return (
      <AdminPage
        rooms={adminRooms}
        onRefresh={async () => {
          try {
            const response = await fetch(`${SIGNALING_URL}/api/admin/rooms`);
            const data = await response.json();
            setAdminRooms(Array.isArray(data.rooms) ? data.rooms : []);
          } catch {
            setAdminRooms([]);
          }
        }}
        onBack={() => setRole(null)}
      />
    );
  }

  return (
    <ClassroomPage
      role={role}
      roomId={roomId}
      status={status}
      roomInput={roomInput}
      setRoomInput={setRoomInput}
      onCreateRoom={handleCreateRoom}
      onJoinRoom={handleJoinRoom}
      onLeaveRoom={handleLeaveRoom}
      onEndRoom={handleEndRoom}
      participants={participants}
      micEnabled={micEnabled}
      camEnabled={camEnabled}
      onToggleMic={handleToggleMic}
      onToggleCam={handleToggleCam}
      messages={messages}
      chatInput={chatInput}
      setChatInput={setChatInput}
      onSendChat={handleSendChat}
    />
  );
}

export default App;
