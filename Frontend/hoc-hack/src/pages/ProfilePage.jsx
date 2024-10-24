import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import axios from 'axios';
import io from 'socket.io-client';
import ChatBox from '../componets/Chatbox'; // Import the ChatBox component

const staticProfiles = [
  { 
    id: '1', 
    name: 'Alice', 
    image: { uri: 'https://avatars.githubusercontent.com/u/95208?v=4' },
    skills: ['React', 'JavaScript', 'CSS'],
    github: 'https://github.com/alice',
    linkedin: 'https://linkedin.com/in/alice',
    location: 'New York, USA',
    experience: '3 years',
    education: 'B.Tech in Computer Science',
  },
  { 
    id: '2', 
    name: 'Bob', 
    image: { uri: 'https://via.placeholder.com/300x400.png?text=Bob' }, 
    skills: ['Node.js', 'Express', 'MongoDB'],
    github: 'https://github.com/bob',
    linkedin: 'https://linkedin.com/in/bob',
    location: 'Los Angeles, USA',
    experience: '5 years',
    education: 'M.Sc. in Software Engineering',
  },
  { 
    id: '3', 
    name: 'Charlie', 
    image: { uri: 'https://via.placeholder.com/300x400.png?text=Charlie' }, 
    skills: ['Python', 'Django', 'SQL'],
    github: 'https://github.com/charlie',
    linkedin: 'https://linkedin.com/in/charlie',
    location: 'San Francisco, USA',
    experience: '2 years',
    education: 'B.Sc. in Information Technology',
  },
];

export default function ProfilePage() {
  const [profiles, setProfiles] = useState(staticProfiles);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [preference, setPreference] = useState('');
  const [socket, setSocket] = useState(null);
  const [chatRequests, setChatRequests] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [acceptedChat, setAcceptedChat] = useState(false); // Track whether a chat is accepted
  const [roomId, setRoomId] = useState(null); // Room ID for the chat

  // Login form states
  const [username, setUsername] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);

  // Establish WebSocket connection and join room on login
  useEffect(() => {
    if (loggedIn) {
      const socketIo = io('http://localhost:3000', {
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
      });
      setSocket(socketIo);
  
      socketIo.on('connect', () => {
        console.log('Connected to WebSocket:', socketIo.id);
        if (currentUserId) {
          console.log(`Joining room for user: room-${currentUserId}`);
          socketIo.emit('join-room', `room-${currentUserId}`);
        }
      });

      // Listen for incoming chat requests
      socketIo.on('chat-request', (data) => {
        console.log('Received chat request:', data);
        setChatRequests((prevRequests) => [...prevRequests, data]);
      });

      // Listen for chat acceptance and set the room ID
      socketIo.on('chat-accepted', (data) => {
        console.log('Chat accepted:', data); // Debugging log
        setRoomId(data.roomId); // Set the room ID for the chat
        setAcceptedChat(true); // Set the chat as accepted to display the ChatBox

        // Debugging logs
        console.log('Room ID set to:', data.roomId);
        console.log('Accepted chat state:', true);
      });
  
      socketIo.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
      });
  
      return () => {
        socketIo.disconnect();
      };
    }
  }, [loggedIn, currentUserId]);

  const fetchProfiles = async (pref) => {
    try {
      const response = await axios.post('http://localhost:3000/findmatch', { pref: pref });
      const fetchedProfiles = response.data;
      setProfiles([...fetchedProfiles]);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    }
  };

  const handleSwipe = (direction) => {
    setCurrentIndex((prevIndex) => {
      if (direction === 'left') return (prevIndex + 1) % profiles.length;
      if (direction === 'right') return prevIndex === 0 ? profiles.length - 1 : prevIndex - 1;
      return prevIndex;
    });
  };

  const handleDragEnd = (event, info) => {
    const dragThreshold = 120; // Adjust sensitivity
    if (info.offset.x > dragThreshold) handleSwipe('right');
    else if (info.offset.x < -dragThreshold) handleSwipe('left');
    setDragging(false);
  };

  const handleLike = (likedUserId) => {
    if (socket) {
      console.log('Sending like event', { likerId: currentUserId, likedUserId });
      socket.emit('like', { likerId: currentUserId, likedUserId });
      alert('You liked this user!');
    }
  };

  const handleAcceptChat = (likerId) => {
    if (socket) {
      socket.emit('accept-chat', { accepterId: currentUserId, likerId });
      setChatRequests(chatRequests.filter((req) => req.likerId !== likerId)); // Remove request after accepting
      alert('You accepted the chat request!');
    }
  };

  const handleLogin = () => {
    // Simulate a login by setting the current user
    if (username === 'Alice') setCurrentUserId('1');
    if (username === 'Bob') setCurrentUserId('2');
    setLoggedIn(true);
  };

  return (
    <div className="container mx-auto p-8">
      {!loggedIn ? (
        <div className="login-form mb-4">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username (Alice or Bob)"
            className="border p-2 mr-2"
          />
          <button onClick={handleLogin} className="bg-blue-500 text-white px-4 py-2 rounded">Login</button>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <input
              type="text"
              value={preference}
              onChange={(e) => setPreference(e.target.value)}
              placeholder="Enter your preference (e.g., JavaScript, Python)"
              className="border p-2 mr-2"
            />
            <button onClick={() => fetchProfiles(preference)} className="bg-blue-500 text-white px-4 py-2 rounded">Find Matches</button>
          </div>

          <AnimatePresence>
            {profiles.slice(currentIndex, currentIndex + 1).map((profile) => (
              <motion.div
                key={profile.id}
                className={`card ${dragging ? 'dragging' : ''} bg-white shadow-lg rounded-md p-6 relative`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragStart={() => setDragging(true)}
                onDragEnd={handleDragEnd}
              >
                <div className="profile-container flex">
                  <img src={profile.image.uri} alt={profile.name} className="rounded-full w-32 h-32 mr-4" />
                  <div className="details text-left">
                    <h2 className="text-2xl font-bold mb-2">{profile.name}</h2>
                    <p><strong>Skills:</strong> {profile.skills.join(', ')}</p>
                    <p><strong>Location:</strong> {profile.location}</p>
                    <p><strong>Experience:</strong> {profile.experience}</p>
                    <p><strong>Education:</strong> {profile.education}</p>
                    <div className="flex space-x-4 mt-4">
                      <a href={profile.github} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                        <FaGithub size={30} />
                      </a>
                      <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                        <FaLinkedin size={30} />
                      </a>
                    </div>
                    <button onClick={() => handleLike(profile.id)} className="mt-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">Like</button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Show ChatBox if a chat request is accepted */}
          {acceptedChat && roomId && (
            <ChatBox socket={socket} roomId={roomId} currentUserId={currentUserId} />
          )}

          {/* Chat Requests */}
          {chatRequests.length > 0 && (
            <div className="chat-requests bg-gray-100 p-4 rounded-md mt-4">
              <h3 className="text-xl font-bold mb-4">Chat Requests</h3>
              {chatRequests.map((req) => (
                <div key={req.likerId} className="request-item mb-2">
                  <p>{req.likerName} wants to chat with you.</p>
                  <button onClick={() => handleAcceptChat(req.likerId)} className="bg-green-500 text-white px-4 py-2 rounded mr-2">Accept</button>
                  <button className="bg-red-500 text-white px-4 py-2 rounded">Reject</button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
