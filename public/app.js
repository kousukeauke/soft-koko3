const socket = io();
const loginDiv = document.getElementById("login");
const chatDiv = document.getElementById("chat");
const nameInput = document.getElementById("nameInput");
const roomInput = document.getElementById("roomInput");
const joinBtn = document.getElementById("joinBtn");
const messages = document.getElementById("messages");
const msgInput = document.getElementById("msgInput");
const sendBtn = document.getElementById("sendBtn");
const usersDiv = document.getElementById("users");
const roomTitle = document.getElementById("roomTitle");

let currentRoom = "";

joinBtn.onclick = () => {
  const name = nameInput.value || "名無しさん";
  const room = roomInput.value || "default";
  currentRoom = room;

  socket.emit("joinRoom", { room, name });

  loginDiv.style.display = "none";
  chatDiv.style.display = "block";
  roomTitle.textContent = `ルーム: ${room}`;
};

sendBtn.onclick = () => {
  const msg = msgInput.value;
  if (msg.trim()) {
    socket.emit("chatMessage", msg);
    msgInput.value = "";
  }
};

socket.on("chatMessage", ({ name, text, senderId }) => {
  const div = document.createElement("div");
  div.classList.add("message");
  div.classList.add(senderId === socket.id ? "self" : "other");
  div.textContent = `${name}: ${text}`;
  messages.appendChild(div);

  // 📌 自動スクロール
  messages.scrollTop = messages.scrollHeight;
});

socket.on("chatHistory", (history) => {
  history.forEach(({ name, text, senderId }) => {
    const div = document.createElement("div");
    div.classList.add("message");
    div.classList.add(senderId === socket.id ? "self" : "other");
    div.textContent = `${name}: ${text}`;
    messages.appendChild(div);
  });

  // 📌 履歴読み込み後も最新へスクロール
  messages.scrollTop = messages.scrollHeight;
});

socket.on("updateUsers", (users) => {
  usersDiv.textContent = "参加者: " + users.join(", ");
});
