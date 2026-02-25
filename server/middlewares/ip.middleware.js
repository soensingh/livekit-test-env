const ipMiddleware = (req, _res, next) => {
  req.clientIp = req.ip;
  next();
};

module.exports = {
  ipMiddleware,
};
