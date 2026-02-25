const { roomService } = require('../services/services');

const createRoom = (req, res) => {
  const { name } = req.body || {};
  const teacherIp = req.clientIp;
  const room = roomService.createRoom({ teacherIp, teacherName: name });
  roomService.setLive(room.id);
  console.log(`[HTTP] room:create ${room.id} teacher=${teacherIp}`);
  return res.status(201).json({ roomId: room.id, state: room.state });
};

const joinRoom = (req, res) => {
  const { roomId, name } = req.body || {};
  const studentIp = req.clientIp;
  const room = roomService.getRoom(roomId);
  if (!room) {
    return res.status(404).json({ error: 'ROOM_NOT_FOUND' });
  }
  if (room.state !== 'LIVE') {
    return res.status(400).json({ error: 'ROOM_NOT_LIVE' });
  }
  roomService.addStudent(roomId, { studentIp, studentName: name });
  console.log(`[HTTP] room:join ${roomId} student=${studentIp}`);
  return res.status(200).json({ roomId, state: room.state });
};

const endRoom = (req, res) => {
  const { roomId } = req.params;
  const room = roomService.getRoom(roomId);
  if (!room) {
    return res.status(404).json({ error: 'ROOM_NOT_FOUND' });
  }
  roomService.endRoom(roomId);
  console.log(`[HTTP] room:end ${roomId}`);
  return res.status(200).json({ roomId, state: 'ENDED' });
};

module.exports = {
  createRoom,
  joinRoom,
  endRoom,
};
