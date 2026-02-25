const express = require('express');
const { adminController } = require('../controllers/controllers');

const router = express.Router();

router.get('/admin/rooms', adminController.listRooms);

module.exports = {
  adminRoutes: router,
};
