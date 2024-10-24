import { useState, useEffect } from 'react';

const ChatBox = ({ socket, roomId, currentUserId }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]); // Stores the conversation messages

  // Listen for incoming chat messages
  useEffect(() => {
    if (socket) {
      socket.on('receive-message', (data) => {
        console.log('Received message from server:', data); // Debugging log
        setMessages((prevMessages) => [...prevMessages, data]); // Append new message to the chat
      });
    }

    // Cleanup listener when component unmounts
    return () => {
      if (socket) {
        socket.off('receive-message');
      }
    };
  }, [socket]);

  const sendMessage = () => {
    if (socket && message) {
      const messageData = { roomId, message, senderId: currentUserId };
      console.log('Sending message:', messageData); // Debugging log
      socket.emit('send-message', messageData); // Send the message to the server
      setMessages((prevMessages) => [...prevMessages, messageData]); // Append sent message to chat
      setMessage(''); // Clear the input
    }
  };

  return (
    <div className="chatbox">
      <div className="chatbox-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.senderId === currentUserId ? 'sent' : 'received'}`}>
            <p>{msg.message}</p>
          </div>
        ))}
      </div>

      <div className="chatbox-input">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage} className="bg-blue-500 text-white px-4 py-2 rounded">Send</button>
      </div>
    </div>
  );
};

export default ChatBox;
