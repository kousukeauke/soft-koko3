const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const path = require("path");

app.use(express.static(path.join(__dirname, "public")));

const rooms = {}; // { roomKey: { messages: [], users: {}, lastSeen: {} } }

io.on("connection", (socket) => {
  let currentRoom = null;
  let userName = "名無しさん";

  socket.on("joinRoom", ({ room, name }) => {
    currentRoom = room;
    userName = name || "名無しさん";

    if (!rooms[currentRoom]) {
      rooms[currentRoom] = { messages: [], users: {}, lastSeen: {} };
    }

    rooms[currentRoom].users[socket.id] = userName;
    rooms[currentRoom].lastSeen[socket.id] = Date.now();

    socket.join(currentRoom);
    socket.emit("chatHistory", rooms[currentRoom].messages);
    io.to(currentRoom).emit("updateUsers", Object.values(rooms[currentRoom].users));
  });

  socket.on("chatMessage", (msg) => {
    if (!currentRoom) return;
    const message = { name: userName, text: msg, senderId: socket.id };
    rooms[currentRoom].messages.push(message);
    io.to(currentRoom).emit("chatMessage", message);
  });

  socket.on("changeName", (newName) => {
    if (!currentRoom) return;
    userName = newName;
    rooms[currentRoom].users[socket.id] = userName;
    io.to(currentRoom).emit("updateUsers", Object.values(rooms[currentRoom].users));
  });

  socket.on("disconnect", () => {
    if (currentRoom && rooms[currentRoom]) {
      rooms[currentRoom].lastSeen[socket.id] = Date.now();
      setTimeout(() => {
        const lastSeen = rooms[currentRoom]?.lastSeen[socket.id];
        if (lastSeen && Date.now() - lastSeen >= 3600000) { // 1時間
          delete rooms[currentRoom].users[socket.id];
          delete rooms[currentRoom].lastSeen[socket.id];
          io.to(currentRoom).emit("updateUsers", Object.values(rooms[currentRoom].users));
        }
      }, 3600000);
    }
  });
});

http.listen(3000, () => {
  console.log("listening on *:3000");
});
