const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const {
	generateMessage,
	generateLocationMessage
} = require('./utils/messages');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const publicDirectoryPath = path.join(__dirname, '../public');
app.use(express.static(publicDirectoryPath));

io.on('connection', (socket) => {
	console.log('New WebSocket Connection');

	socket.emit('message', generateMessage('welcome!!'));

	socket.broadcast.emit('message', generateMessage('A new user has joined!'));

	socket.on('sendMessage', (message, callback) => {
		const filter = new Filter();
		if (filter.isProfane(message)) {
			return callback('Profanity is not allowed');
		}

		io.emit('message', generateMessage(message));
		callback();
	});

	socket.on('sendLocation', ({ latitude, longitude }, callback) => {
		io.emit(
			'locationMessage',
			generateLocationMessage(
				`https://google.com/maps?q=${latitude},${longitude}`
			)
		);
		callback();
	});

	socket.on('disconnect', () => {
		io.emit('message', generateMessage('A user has left!'));
	});
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
	console.log(`server is listening on port ${PORT}`);
});
