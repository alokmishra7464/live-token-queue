// Entry point: connect DB -> create HTTP server -> attach Socket.io -> listen
require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const connectDB = require('./src/config/db');
const { initSocket } = require('./src/socket');

const PORT = process.env.PORT || 5000;

(async () => {
  await connectDB();
  const server = http.createServer(app);
  initSocket(server);
  server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
})();
