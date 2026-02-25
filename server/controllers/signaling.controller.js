const { roomService } = require('../services/services');

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
      const { name } = payload;
      const teacherIp = socket.handshake.address;
      const room = roomService.createRoom({ teacherIp, teacherName: name });
      roomService.setLive(room.id);
      socket.join(room.id);
      socket.data.role = 'teacher';
      socket.data.name = name;
      socket.data.roomId = room.id;
      console.log(`[SOCKET] room:create ${room.id} teacher=${teacherIp}`);
      if (ack) {
        return ack({ ok: true, roomId: room.id, state: room.state });
      }
      return socket.emit('room:create', { ok: true, roomId: room.id, state: room.state });
    });

    socket.on('room:join', (payload = {}, ack) => {
      const { roomId, name } = payload;
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
        } else {
          roomService.removeStudent(roomId, socket.handshake.address);
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
      const { roomId, identity, pingMs } = payload;
      if (!roomId || !identity || typeof pingMs !== 'number') return;
      console.log(`[SOCKET] ping room=${roomId} identity=${identity} ms=${pingMs}`);
      io.to(roomId).emit('ping:update', { roomId, identity, pingMs });
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
      } else {
        roomService.removeStudent(roomId, socket.handshake.address);
      }
    });
  });
};

module.exports = {
  register,
};
