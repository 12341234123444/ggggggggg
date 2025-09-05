// dd.js
const express = require('express');
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// 🎮 Shared square state
let gameState = {
  square: { x: 100, y: 100 } // starting position
};

// 📨 Long polling queue
let waitingClients = [];

// 🔁 Movement logic
function updateSquare(direction) {
  const step = 10;
  if (direction === 'ArrowUp') gameState.square.y -= step;
  if (direction === 'ArrowDown') gameState.square.y += step;
  if (direction === 'ArrowLeft') gameState.square.x -= step;
  if (direction === 'ArrowRight') gameState.square.x += step;
}

// 📥 Receive player action
app.post('/action', (req, res) => {
  const { action } = req.body;
  if (action?.direction) {
    updateSquare(action.direction);
    broadcastUpdate();
  }
  res.sendStatus(200);
});

// 📡 Broadcast to all waiting clients
function broadcastUpdate() {
  waitingClients.forEach(res => res.json(gameState));
  waitingClients = [];
}

// 🔁 Long polling endpoint
app.get('/poll', (req, res) => {
  waitingClients.push(res);

  // Optional timeout to prevent hanging
  setTimeout(() => {
    if (waitingClients.includes(res)) {
      res.json(gameState);
      waitingClients = waitingClients.filter(r => r !== res);
    }
  }, 30000); // 30 seconds
});

app.get('/', (req, res) => {
  res.send('Server is running');
});

// 🚀 Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

});
