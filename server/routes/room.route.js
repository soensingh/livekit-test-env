const express = require('express');
const { roomController } = require('../controllers/controllers');

const router = express.Router();

router.post('/rooms', roomController.createRoom);
router.post('/rooms/join', roomController.joinRoom);
router.post('/rooms/:roomId/end', roomController.endRoom);

module.exports = {
  roomRoutes: router,
};
