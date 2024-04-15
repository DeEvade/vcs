import express from "express";
const app = express();
import { Server } from "socket.io";
import { createServer } from "http";
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

io.on("connection", (socket: any) => {
  console.log("a user connected");
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
  socket.on("chat message", (msg: string) => {
    console.log("message: " + msg);
    io.emit("chat message", msg);
  });
});

const port = process.env.PORT || 3001;

server.listen(port, () => {
  console.log(`Server running on  https://localhost:${port}`);
});
