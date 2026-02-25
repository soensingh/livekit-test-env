require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const { roomRoutes, signalingRoutes, adminRoutes } = require('./routes/routes');
const { ipMiddleware } = require('./middlewares/middlewares');
const { signalingController } = require('./controllers/controllers');

const app = express();

app.use(cors({
	origin: process.env.CORS_ORIGIN || '*',
	methods: ['GET', 'POST'],
}));
app.use(express.json());
app.use(ipMiddleware);
app.use((req, _res, next) => {
	console.log(`[HTTP] ${req.method} ${req.url} from ${req.ip}`);
	next();
});

app.use('/api', roomRoutes);
app.use('/api', signalingRoutes);
app.use('/api', adminRoutes);

const server = http.createServer(app);

const io = new Server(server, {
	cors: {
		origin: process.env.CORS_ORIGIN || '*',
		methods: ['GET', 'POST'],
	},
});

signalingController.register(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
	console.log(`Server listening on 0.0.0.0:${PORT}`);
});
