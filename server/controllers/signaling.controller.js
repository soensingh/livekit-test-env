const { roomService } = require('../services/services');

const roomMembers = new Map();

const ensureRoomMemberMap = (roomId) => {
  if (!roomMembers.has(roomId)) {
    roomMembers.set(roomId, new Map());
  }
  return roomMembers.get(roomId);
};

const upsertRoomMember = ({ roomId, socketId, identity, name, role, ip }) => {
  if (!roomId || !socketId) return;
  const members = ensureRoomMemberMap(roomId);
  members.set(socketId, {
    socketId,
    identity: identity || socketId,
    name: name || 'Guest',
    role: role || 'guest',
    ip: ip || 'unknown',
  });
};

const removeRoomMember = ({ roomId, socketId }) => {
  if (!roomId || !socketId) return;
  const members = roomMembers.get(roomId);
  if (!members) return;
  members.delete(socketId);
  if (members.size === 0) {
    roomMembers.delete(roomId);
  }
};

const emitParticipantsUpdate = (io, roomId) => {
  if (!roomId) return;
  const members = roomMembers.get(roomId);
  const participants = members
    ? Array.from(members.values()).map((member) => ({
      identity: member.identity,
      name: member.name,
      role: member.role,
      ip: member.ip,
    }))
    : [];
  io.to(roomId).emit('participants:update', { roomId, participants });
};

const register = (io) => {
  io.on('connection', (socket) => {
    console.log(`[SOCKET] connected ${socket.id} ip=${socket.handshake.address}`);
    socket.data.role = null;
    socket.data.name = null;
    socket.data.roomId = null;

    socket.on('role:selected', (payload = {}) => {
      const { role, name } = payload;
      socket.data.role = role;
      socket.data.name = name;
      console.log(`[SOCKET] role:selected ${socket.id} role=${role}`);
    });

    socket.on('room:create', (payload = {}, ack) => {
      const { name, identity } = payload;
      const teacherIp = socket.handshake.address;
      const room = roomService.createRoom({ teacherIp, teacherName: name });
      roomService.setLive(room.id);
      socket.join(room.id);
      socket.data.role = 'teacher';
      socket.data.name = name;
      socket.data.roomId = room.id;
      socket.data.identity = identity || `teacher-${socket.id}`;

      upsertRoomMember({
        roomId: room.id,
        socketId: socket.id,
        identity: socket.data.identity,
        name,
        role: 'teacher',
        ip: teacherIp,
      });
      emitParticipantsUpdate(io, room.id);

      console.log(`[SOCKET] room:create ${room.id} teacher=${teacherIp}`);
      if (ack) {
        return ack({ ok: true, roomId: room.id, state: room.state });
      }
      return socket.emit('room:create', { ok: true, roomId: room.id, state: room.state });
    });

    socket.on('room:join', (payload = {}, ack) => {
      const { roomId, name, identity } = payload;
      const studentIp = socket.handshake.address;
      const room = roomService.getRoom(roomId);
      if (!room) {
        if (ack) return ack({ ok: false, error: 'ROOM_NOT_FOUND' });
        return socket.emit('room:join', { ok: false, error: 'ROOM_NOT_FOUND' });
      }
      if (room.state !== 'LIVE') {
        if (ack) return ack({ ok: false, error: 'ROOM_NOT_LIVE' });
        return socket.emit('room:join', { ok: false, error: 'ROOM_NOT_LIVE' });
      }
      roomService.addStudent(roomId, { studentIp, studentName: name });
      socket.join(roomId);
      socket.data.role = 'student';
      socket.data.name = name;
      socket.data.roomId = roomId;
      socket.data.identity = identity || `student-${socket.id}`;

      upsertRoomMember({
        roomId,
        socketId: socket.id,
        identity: socket.data.identity,
        name,
        role: 'student',
        ip: studentIp,
      });
      emitParticipantsUpdate(io, roomId);

      console.log(`[SOCKET] room:join ${roomId} student=${studentIp}`);
      if (ack) {
        return ack({ ok: true, roomId, state: room.state });
      }
      return socket.emit('room:join', { ok: true, roomId, state: room.state });
    });

    socket.on('room:leave', (payload = {}, ack) => {
      const { roomId } = payload;
      const room = roomService.getRoom(roomId);
      if (room) {
        if (socket.data.role === 'teacher') {
          roomService.endRoom(roomId);
          io.to(roomId).emit('room:end', { roomId });
          roomMembers.delete(roomId);
        } else {
          roomService.removeStudent(roomId, socket.handshake.address);
          removeRoomMember({ roomId, socketId: socket.id });
          emitParticipantsUpdate(io, roomId);
        }
      }
      socket.leave(roomId);
      console.log(`[SOCKET] room:leave ${roomId} socket=${socket.id}`);
      if (ack) return ack({ ok: true });
      return undefined;
    });

    socket.on('room:end', (payload = {}, ack) => {
      const { roomId } = payload;
      const room = roomService.getRoom(roomId);
      if (room && socket.data.role === 'teacher') {
        roomService.endRoom(roomId);
        io.to(roomId).emit('room:end', { roomId });
        roomMembers.delete(roomId);
      }
      console.log(`[SOCKET] room:end ${roomId} socket=${socket.id}`);
      if (ack) return ack({ ok: true });
      return undefined;
    });

    // WebRTC signaling is relayed to the SFU (or any socket joined to the room).
    socket.on('webrtc:offer', (payload = {}) => {
      const { roomId } = payload;
      if (!roomId) return;
      console.log(`[SOCKET] webrtc:offer room=${roomId} socket=${socket.id}`);
      socket.to(roomId).emit('webrtc:offer', payload);
    });

    socket.on('webrtc:answer', (payload = {}) => {
      const { roomId } = payload;
      if (!roomId) return;
      console.log(`[SOCKET] webrtc:answer room=${roomId} socket=${socket.id}`);
      socket.to(roomId).emit('webrtc:answer', payload);
    });

    socket.on('webrtc:ice', (payload = {}) => {
      const { roomId } = payload;
      if (!roomId) return;
      console.log(`[SOCKET] webrtc:ice room=${roomId} socket=${socket.id}`);
      socket.to(roomId).emit('webrtc:ice', payload);
    });

    socket.on('ping:echo', (payload = {}, ack) => {
      const { roomId } = payload;
      if (!roomId) return;
      if (ack) ack({ ok: true });
    });

    socket.on('ping:report', (payload = {}) => {
      const {
        roomId,
        identity,
        pingMs,
        totalPackets,
        lostPackets,
        lossPercent,
      } = payload;
      if (!roomId || !identity || typeof pingMs !== 'number') return;
      console.log(`[SOCKET] ping room=${roomId} identity=${identity} ms=${pingMs}`);
      const reporterIp = socket.handshake.address;
      io.to(roomId).emit('ping:update', {
        roomId,
        identity,
        pingMs,
        totalPackets: typeof totalPackets === 'number' ? totalPackets : undefined,
        lostPackets: typeof lostPackets === 'number' ? lostPackets : undefined,
        lossPercent: typeof lossPercent === 'number' ? lossPercent : undefined,
        ip: reporterIp,
      });
    });

    socket.on('chat:message', (payload = {}) => {
      const { roomId, text, sender, id, timestamp } = payload;
      if (!roomId || !text) return;
      console.log(`[SOCKET] chat:message room=${roomId} sender=${sender}`);
      io.to(roomId).emit('chat:message', {
        roomId,
        text,
        sender,
        id,
        timestamp,
      });
    });

    socket.on('disconnect', () => {
      const { roomId, role } = socket.data;
      console.log(`[SOCKET] disconnected ${socket.id} room=${roomId || 'none'}`);
      if (!roomId) return;
      if (role === 'teacher') {
        roomService.endRoom(roomId);
        io.to(roomId).emit('room:end', { roomId });
        roomMembers.delete(roomId);
      } else {
        roomService.removeStudent(roomId, socket.handshake.address);
        removeRoomMember({ roomId, socketId: socket.id });
        emitParticipantsUpdate(io, roomId);
      }
    });
  });
};

module.exports = {
  register,
};
