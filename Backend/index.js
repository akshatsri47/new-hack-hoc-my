// require("dotenv").config();

// const express = require("express");
// const passport = require("passport");
// const session = require("express-session");
// const { default: mongoose } = require("mongoose");
// const homeRouter = require("./routes/githubAuth");
// const registerRouter = require("./routes/register");
// const filterRouter = require("./routes/filteredUser");
// const GithubStrategy = require("passport-github2").Strategy;
// const cors = require('cors')
// const dislikeRouter = require('./routes/dislikeUser');
// const { Server } = require("socket.io");
// const http = require('http');
// const likeuser = require('./controllers/likeuser')
// try{
//     mongoose.connect('mongodb+srv://adnanali11875:helloworld@cluster0.caghz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0').then(()=>{
//         console.log("Connected to db")
//     })
// }catch(e){
//     console.log(e.message);
// }
// const app = express();
// app.use(express.json());
// app.use(
//   session({
//     secret: "secret",
//     resave: false,
//     saveUninitialized: true,
//   })
// );

// app.use(passport.initialize());
// app.use(passport.session());
// app.use(cors())
// app.use('/',homeRouter);
// app.use('/',registerRouter);
// app.use('/',filterRouter);

// // Add this to your app middleware
// app.use('/', dislikeRouter);
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: "*", // Allow any origin for simplicity (you should restrict this in production)
//   },
// });

// // Handle WebSocket connections
// io.on("connection", (socket) => {
//   console.log("A user connected:", socket.id);

//   // Join a user to a room (for messaging when liked)
//   socket.on("join-room", (roomId) => {
//     socket.join(roomId);
//     console.log(`User with ID: ${socket.id} joined room: ${roomId}`);
//   });

//   // Notify the liked user
//   socket.on("like", ({ likerId, likedUserId }) => {
//     const roomId = `room-${likedUserId}`; // Define room based on liked user's ID
//     io.to(roomId).emit("liked", { msg: `User ${likerId} liked you!` });
//     console.log(`User ${likerId} liked User ${likedUserId}, message sent to room: ${roomId}`);
//   });

//   socket.on("disconnect", () => {
//     console.log("A user disconnected:", socket.id);
//   });
// });


// app.listen(3000, () => {
//     console.log(`Server is running at port 3000`);
// })

// server.js

require("dotenv").config();
const express = require("express");
const passport = require("passport");
const session = require("express-session");
const { default: mongoose } = require("mongoose");
const homeRouter = require("./routes/githubAuth");
const registerRouter = require("./routes/register");
const filterRouter = require("./routes/filteredUser");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const likeRoutes = require('./routes/likeroutes');

// Setup Mongoose connection
mongoose.connect('mongodb+srv://adnanali11875:helloworld@cluster0.caghz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log("Connected to db"))
  .catch(e => console.log(e.message));

// Initialize Express
const app = express();
app.use(express.json());
app.use(session({
  secret: "secret",
  resave: false,
  saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(cors());

// Setup the HTTP server and Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Use Routes
app.use("/", homeRouter);
app.use("/", registerRouter);
app.use("/", filterRouter);
app.use("/", likeRoutes(io)); // Pass the io instance to the like routes

// Handle WebSocket connections
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    console.log(`User with ID: ${socket.id} joined room: ${roomId}`);
  });

  // Handle the "like" event and send a chat request
  socket.on("like", ({ likerId, likedUserId }) => {
    const roomId = `room-${likedUserId}`;
    
    // Emit a chat request to the liked user
    io.to(roomId).emit("chat-request", {
      likerId,
      likerName: "Liker User", // Fetch the actual liker user name from your database
    });

    console.log(`Chat request sent from ${likerId} to ${likedUserId}`);
  });

  // Handle the "accept-chat" event
  socket.on("accept-chat", ({ accepterId, likerId }) => {
    const roomId = `room-${accepterId}-${likerId}`; // Generate a unique room ID for both users

    // Notify both users to join the common room for chatting
    io.to(`room-${accepterId}`).emit("chat-accepted", { accepterId, likerId, roomId });
    io.to(`room-${likerId}`).emit("chat-accepted", { accepterId, likerId, roomId });

    console.log(`Chat accepted between ${accepterId} and ${likerId}, users joined room: ${roomId}`);
  });

  // Handle sending messages
  socket.on("send-message", ({ roomId, message, senderId }) => {
    // Broadcast the message to everyone in the room
    io.to(roomId).emit("receive-message", { message, senderId });
  
    console.log(`Message sent in room ${roomId} by user ${senderId}: ${message}`);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});


// Start the server
server.listen(3000, () => {
  console.log(`Server is running at port 3000`);
});
