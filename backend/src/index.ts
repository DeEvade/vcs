
import express from "express";

const app = express();

import { Server } from "socket.io";
import { createServer } from "http";


import { DataSource } from "typeorm"
import { Configuration } from "./database/entities/Configuration";
import { Frequency } from "./database/entities/Frequency";
import { Role } from "./database/entities/Role";
import { AppDataSource } from "./database/data-source";


AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!")
  })
  .catch((err: any) => {
    console.error("Error during Data Source initialization", err)
  })


app.get("/", (req: any, res: any) => {
  try {
    const configuration = new Configuration();
    configuration.name = "Test Configuration";
    AppDataSource.getRepository(Configuration).save(configuration);
    res.send("Hello World!");

  } catch (error) {
    res.send("Error: " + error.message);

  }
});

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

const port = process.env.SERVER_PORT || 3001;

server.listen(port, () => {
  console.log(`Server running on  http://localhost:${port}`);
});
