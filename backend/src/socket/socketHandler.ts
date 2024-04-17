import { Server, Socket } from "socket.io";
import { Configuration } from "../database/entities/Configuration";
import { Role } from "../database/entities/Role";
import { DataSource } from "typeorm";
import { Frequency } from "../database/entities/Frequency";
import { RoleFrequency } from "../database/entities/RoleFrequency";

const socketHandler = (io: Server, AppDataSource: DataSource) => {
  const users = {} as { [key: string]: Socket };
  io.on("connection", (socket: Socket) => {
    console.log("a user connected");
    if (!users[socket.id]) {
      users[socket.id] = socket;
    }

    socket.on("callUser", (data) => {
      io.to(data.userToCall).emit("hey", {
        signal: data.signalData,
        from: data.from,
      });
    });

    socket.emit("yourID", socket.id);
    io.sockets.emit("allUsers", users);
    socket.on("disconnect", () => {
      delete users[socket.id];
    });

    socket.on("acceptCall", (data) => {
      io.to(data.to).emit("callAccepted", data.signal);
    });

    socket.on("getCurrentConfig", async () => {
      console.log("asking for config");
      try {
        const configRepository = AppDataSource.getRepository(Configuration);
        const freqRepository = AppDataSource.getRepository(Frequency);
        const roleRepository = AppDataSource.getRepository(Role);
        const roleFreqRepository = AppDataSource.getRepository(RoleFrequency);

        const configId = 1;

        const config = await configRepository.findOneBy({ id: configId });

        const roles = await roleRepository.find({
          relations: { roleFrequency: { frequency: true } },
          where: { configuration: { id: configId } },
        });
        if (!config || !roles) {
          throw new Error("No configuration found");
        }
        config.roles = roles;

        socket.emit("getCurrentConfig", config);
      } catch (error) {
        console.log("Error during default configuration creation", error);
        socket.emit("getConfig", { error: error.message });
      }
    });
    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
  });
};

export default socketHandler;
