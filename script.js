// script.js

document.addEventListener('DOMContentLoaded', () => {
  const chat = document.getElementById('chat');
  const messageInput = document.getElementById('messageInput');
  const sendButton = document.getElementById('sendButton');
  const messages = document.getElementById('messages');
  const usersList = document.getElementById('users');
  const typingStatus = document.getElementById('typingStatus');

  const socket = new WebSocket('ws://localhost:8080');

  let username = prompt('Digite seu nome de usuário:');
  if (!username) {
      username = `User${Math.floor(Math.random() * 1000)}`;
  }

  socket.addEventListener('open', () => {
      socket.send(JSON.stringify({ type: 'join', username }));
  });

  socket.addEventListener('message', event => {
      const data = JSON.parse(event.data);

      if (data.type === 'message') {
          const messageContainer = document.createElement('div');
          messageContainer.classList.add('message-container', data.username === username ? 'my-message' : 'other-message');

          const message = document.createElement('div');
          message.classList.add('message');
          message.textContent = `${data.username}: ${data.message}`;

          const timestamp = new Date().toLocaleTimeString();
          const timestampSpan = document.createElement('span');
          timestampSpan.classList.add('timestamp');
          timestampSpan.textContent = timestamp;

          message.appendChild(timestampSpan);
          messageContainer.appendChild(message);
          messages.appendChild(messageContainer);
          messages.scrollTop = messages.scrollHeight;
      } else if (data.type === 'notification') {
          const notification = document.createElement('div');
          notification.textContent = data.message;
          notification.style.fontStyle = 'italic';
          messages.appendChild(notification);
          messages.scrollTop = messages.scrollHeight;
      } else if (data.type === 'userlist') {
          updateOnlineUsers(data.users);
      } else if (data.type === 'typing') {
          typingStatus.textContent = data.message;
      }
  });

  sendButton.addEventListener('click', () => {
      const message = messageInput.value;
      if (message.trim() !== '') {
          socket.send(JSON.stringify({ type: 'message', message }));
          const myMessageContainer = document.createElement('div');
          myMessageContainer.classList.add('message-container', 'my-message');

          const myMessage = document.createElement('div');
          myMessage.classList.add('message');
          myMessage.textContent = `${username}: ${message}`;

          const timestamp = new Date().toLocaleTimeString();
          const timestampSpan = document.createElement('span');
          timestampSpan.classList.add('timestamp');
          timestampSpan.textContent = timestamp;

          myMessage.appendChild(timestampSpan);
          myMessageContainer.appendChild(myMessage);
          messages.appendChild(myMessageContainer);
          messages.scrollTop = messages.scrollHeight;
          messageInput.value = '';
          typingStatus.textContent = '';
      }
  });

  messageInput.addEventListener('input', () => {
      socket.send(JSON.stringify({ type: 'typing', message: `${username} está digitando...` }));
  });

  messageInput.addEventListener('keyup', event => {
      if (event.key === 'Enter') {
          sendButton.click();
      }
  });

  messageInput.addEventListener('blur', () => {
      socket.send(JSON.stringify({ type: 'typing', message: '' }));
  });

  function updateOnlineUsers(users) {
      usersList.innerHTML = '';
      users.forEach(user => {
          const userItem = document.createElement('li');
          userItem.id = `user-${user.username}`;
          userItem.classList.add(user.status === 'online' ? 'online' : 'offline');
          const onlineIndicator = document.createElement('div');
          onlineIndicator.classList.add('online-indicator');
          onlineIndicator.classList.add(user.status === 'online' ? 'online' : 'offline');
          userItem.appendChild(onlineIndicator);
          userItem.appendChild(document.createTextNode(user.username));
          usersList.appendChild(userItem);
      });
  }
});
