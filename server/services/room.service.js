const crypto = require('crypto');
const { createRoom } = require('../models/models');

const rooms = new Map();

const generateRoomId = () => {
  return crypto.randomBytes(4).toString('base64url').toLowerCase();
};

const createRoomEntry = ({ teacherIp, teacherName }) => {
  const roomId = generateRoomId();
  const room = createRoom({ roomId, teacherIp, teacherName });
  rooms.set(roomId, room);
  console.log(`[ROOM] created ${roomId} by ${teacherIp}`);
  return room;
};

const getRoom = (roomId) => rooms.get(roomId);

const setLive = (roomId) => {
  const room = rooms.get(roomId);
  if (!room) return null;
  room.state = 'LIVE';
  console.log(`[ROOM] live ${roomId}`);
  return room;
};

const endRoom = (roomId) => {
  const room = rooms.get(roomId);
  if (!room) return null;
  room.state = 'ENDED';
  console.log(`[ROOM] ended ${roomId}`);
  return room;
};

const addStudent = (roomId, { studentIp, studentName }) => {
  const room = rooms.get(roomId);
  if (!room) return null;
  room.students.set(studentIp, { studentIp, studentName, joinedAt: Date.now() });
  console.log(`[ROOM] join ${roomId} student=${studentIp}`);
  return room;
};

const removeStudent = (roomId, studentIp) => {
  const room = rooms.get(roomId);
  if (!room) return null;
  room.students.delete(studentIp);
  console.log(`[ROOM] leave ${roomId} student=${studentIp}`);
  return room;
};

const listRooms = () => {
  return Array.from(rooms.values()).map((room) => ({
    id: room.id,
    state: room.state,
    teacherName: room.teacherName || 'Teacher',
    studentCount: room.students.size,
  }));
};

module.exports = {
  createRoom: createRoomEntry,
  getRoom,
  setLive,
  endRoom,
  addStudent,
  removeStudent,
  listRooms,
};
