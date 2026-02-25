const { roomService } = require('../services/services');

const listRooms = (_req, res) => {
  const rooms = roomService.listRooms();
  return res.status(200).json({ rooms });
};

module.exports = {
  listRooms,
};
