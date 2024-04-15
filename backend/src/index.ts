import express from "express";
const app = express();
import { Server } from "socket.io";
import { createServer } from "http";

import { ExpressPeerServer } from "peer";
const server = createServer(app);
//const server = app.listen(3001);
const peerServer = ExpressPeerServer(server);
//const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.get("/", (req, res) => {
  res.send("Hej!");
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

app.use("/peersjs", peerServer);

const port = process.env.PORT || 3001;

server.listen(port, () => {
  console.log(`Server running on  https://localhost:${port}`);
});
