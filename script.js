
   
    const chat = document.getElementById('chat');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const messages = document.getElementById('messages');
    const usersList = document.getElementById('users');
    const typingStatus = document.getElementById('typingStatus');

    const socket = new WebSocket('ws://localhost:8080');

    let username = prompt('Digite seu nome de usuário:');
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
      } else if (data.type === 'status') {
        updateStatus(data.username, data.status);
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
      socket.send(JSON.stringify({ type: 'typing', username, message: `${username} está digitando...` }));
    });

    messageInput.addEventListener('keyup', event => {
      if (event.key === 'Enter') {
        sendButton.click();
      }
    });

    messageInput.addEventListener('blur', () => {
      socket.send(JSON.stringify({ type: 'typing', username, message: '' }));
    });

    
    function updateOnlineUsers(users) {
      users.forEach(user => {
        const existingUserItem = document.getElementById(`user-${user.username}`);
        if (!existingUserItem) {
          const userItem = document.createElement('li');
          userItem.id = `user-${user.username}`;
          userItem.classList.add(user.status === 'online' ? 'online' : 'offline');
          const onlineIndicator = document.createElement('div');
          onlineIndicator.classList.add('online-indicator');
          onlineIndicator.classList.add(user.status === 'online' ? 'online' : 'offline');
          userItem.appendChild(onlineIndicator);
          userItem.appendChild(document.createTextNode(user.username));
          usersList.appendChild(userItem);
        } else {
          existingUserItem.className = `user ${user.status === 'online' ? 'online' : 'offline'}`;
          const onlineIndicator = existingUserItem.querySelector('.online-indicator');
          if (onlineIndicator) {
            onlineIndicator.className = `online-indicator ${user.status === 'online' ? 'online' : 'offline'}`;
          }
        }
      });
    }

    
    function updateStatus(username, status) {
      const userItem = document.getElementById(`user-${username}`);
      if (userItem) {
        userItem.className = `user ${status === 'online' ? 'online' : 'offline'}`;
        const onlineIndicator = userItem.querySelector('.online-indicator');
        if (onlineIndicator) {
          onlineIndicator.className = `online-indicator ${status === 'online' ? 'online' : 'offline'}`;
        }
      }
    }
  