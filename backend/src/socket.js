// Real-time: whenever the queue changes, tell every connected browser.
// Browsers then re-fetch their own data (keeps the server simple).
const { Server } = require('socket.io');

let io;

exports.initSocket = (server) => {
  io = new Server(server, { cors: { origin: '*' } });
  io.on('connection', (socket) => console.log('Client connected:', socket.id));
};

exports.notifyQueueChanged = () => {
  if (io) io.emit('queue:update');
};
