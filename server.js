const WebSocket = require('ws');
const port = 8080;

const wss = new WebSocket.Server({ port });

const clients = new Map();

wss.on('connection', ws => {
  let username;

  ws.on('message', message => {
    const data = JSON.parse(message);

    if (data.type === 'join') {
      username = data.username;
      clients.set(username, ws);
      broadcast({ type: 'notification', message: `${username} entrou no chat.` });
      updateUserList();
    } else if (data.type === 'message') {
      broadcast({ type: 'message', username, message: data.message });
    } else if (data.type === 'typing') {
      broadcast({ type: 'typing', message: data.message });
    } else if (data.type === 'status') {
      if (username) {
        clients.delete(username);
        broadcast({ type: 'notification', message: `${username} saiu do chat.` });
        updateUserList();
      }
    }
  });

  ws.on('close', () => {
    if (username) {
      clients.delete(username);
      broadcast({ type: 'notification', message: `${username} saiu do chat.` });
      updateUserList();
    }
  });

  function broadcast(data) {
    const message = JSON.stringify(data);
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  function updateUserList() {
    const users = Array.from(clients.keys()).map(username => ({
      username,
      status: 'online'
    }));
    broadcast({ type: 'userlist', users });
  }
});

console.log(`WebSocket server is running on ws://localhost:${port}`);
