import express from "express";

const app = express();

import { Server, Socket } from "socket.io";
import { createServer } from "http";
import createDefaultConfig from "./database/createDefaultConfig";

import { DataSource } from "typeorm";
import { Configuration } from "./database/entities/Configuration";
import { Frequency } from "./database/entities/Frequency";
import { Role } from "./database/entities/Role";
import { AppDataSource } from "./database/data-source";
import socketHandler from "./socket/socketHandler";

AppDataSource.initialize()
  .then(async () => {
    console.log("Data Source has been initialized!");
    //Check if default config exists
    try {
      const configs = await AppDataSource.getRepository(Configuration).find();
      if (configs.length == 0) {
        await createDefaultConfig(AppDataSource);
      }
    } catch (error) {
      console.log("Error during default configuration creation", error);
    }
  })
  .catch((err: any) => {
    console.error("Error during Data Source initialization", err);
  });

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
socketHandler(io, AppDataSource);

const port = process.env.SERVER_PORT || 3001;

server.listen(port, () => {
  console.log(`Server running on  http://localhost:${port}`);
});
