const createRoom = ({ roomId, teacherIp, teacherName }) => ({
  id: roomId,
  teacherIp,
  teacherName,
  state: 'CREATED',
  createdAt: new Date().toISOString(),
  students: new Map(),
});

module.exports = {
  createRoom,
};
