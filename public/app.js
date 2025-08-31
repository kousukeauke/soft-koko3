function scrollToBottomIfNeeded() {
  const threshold = 50; // どれくらい下に近いか判定（px）
  const isAtBottom = messages.scrollHeight - messages.scrollTop - messages.clientHeight < threshold;
  if (isAtBottom) {
    messages.scrollTop = messages.scrollHeight;
  }
}

socket.on("chatMessage", ({ name, text, senderId }) => {
  const div = document.createElement("div");
  div.classList.add("message");
  div.classList.add(senderId === socket.id ? "self" : "other");
  div.textContent = `${name}: ${text}`;
  messages.appendChild(div);

  // 📌 一番下にいるときだけ追従
  scrollToBottomIfNeeded();
});

socket.on("chatHistory", (history) => {
  history.forEach(({ name, text, senderId }) => {
    const div = document.createElement("div");
    div.classList.add("message");
    div.classList.add(senderId === socket.id ? "self" : "other");
    div.textContent = `${name}: ${text}`;
    messages.appendChild(div);
  });

  // 📌 最初は強制的に一番下へ
  messages.scrollTop = messages.scrollHeight;
});
