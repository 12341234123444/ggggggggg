const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors()); // 🔓 Enables cross-origin requests
app.use(express.json());

const PORT = process.env.PORT || 3000;

let gameState = {
  square: { x: 100, y: 100 }
};

let waitingClients = [];

function updateSquare(direction) {
  const step = 10;
  if (direction === 'ArrowUp') gameState.square.y -= step;
  if (direction === 'ArrowDown') gameState.square.y += step;
  if (direction === 'ArrowLeft') gameState.square.x -= step;
  if (direction === 'ArrowRight') gameState.square.x += step;
}

app.post('/action', (req, res) => {
  console.log('Received action:', req.body);
  if (req.body?.action?.direction) {
    updateSquare(req.body.action.direction);
    broadcastUpdate();
  }
  res.sendStatus(200);
});

function broadcastUpdate() {
  waitingClients.forEach(res => res.json(gameState));
  waitingClients = [];
}

app.get('/poll', (req, res) => {
  waitingClients.push(res);
  setTimeout(() => {
    if (waitingClients.includes(res)) {
      res.json(gameState);
      waitingClients = waitingClients.filter(r => r !== res);
    }
  }, 30000);
});

app.get('/', (req, res) => {
  res.send('Server is running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
