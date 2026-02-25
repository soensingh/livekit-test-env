const express = require('express');
const { sfuService } = require('../services/services');

const router = express.Router();

router.get('/health', (_req, res) => {
  return res.status(200).json({ status: 'ok' });
});

router.post('/sfu/token', async (req, res) => {
  const { roomId, identity, name } = req.body || {};
  const token = await sfuService.issueToken({ roomId, identity, name });
  if (!token) {
    return res.status(200).json({ token: null });
  }
  return res.status(200).json({ token });
});

module.exports = {
  signalingRoutes: router,
};
