let AccessToken;
try {
  ({ AccessToken } = require('livekit-server-sdk'));
} catch {
  AccessToken = null;
}

const buildIceServers = (env) => {
  const servers = [];
  if (env.STUN_URL) {
    servers.push({ urls: env.STUN_URL });
  }
  if (env.TURN_URL) {
    servers.push({
      urls: env.TURN_URL,
      username: env.TURN_USERNAME || '',
      credential: env.TURN_CREDENTIAL || '',
    });
  }
  return servers;
};

const getSfuConfig = () => ({
  url: process.env.SFU_URL || '',
  iceServers: buildIceServers(process.env),
});

const issueToken = async ({ roomId, identity, name }) => {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  if (!AccessToken || !apiKey || !apiSecret || !roomId || !identity) {
    return null;
  }

  const token = new AccessToken(apiKey, apiSecret, {
    identity,
    name: name || identity,
  });

  token.addGrant({
    room: roomId,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
  });

  const maybeJwt = token.toJwt();
  if (typeof maybeJwt === 'string') {
    return maybeJwt;
  }
  return await maybeJwt;
};

module.exports = {
  getSfuConfig,
  issueToken,
};
