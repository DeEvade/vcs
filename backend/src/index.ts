import express from "express";
const app = express();
import { Server } from "socket.io";
import {createServer} from "http";
const server = createServer(app);


const io = new Server(server);

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

server.listen(3001, () => {
  console.log("listening on *:3000");
});
