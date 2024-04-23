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

    //Send all users to all users except the one that just connected
    Object.keys(users).forEach((key) => {
      if (key !== socket.id) {
        users[key].emit("newUser", socket.id);
      }
    });

    socket.on("callUser", (data) => {
      io.to(data.userToCall).emit("hey", {
        signal: data.signalData,
        from: data.from,
      });
    });

    socket.on("disconnect", () => {
      delete users[socket.id];
      io.emit("userLeft", socket.id);
    });

    socket.on("acceptCall", (data) => {
      io.to(data.to).emit("callAccepted", {
        signal: data.signal,
        from: data.from,
      });
    });

    socket.on("getAllData", async () => {
      console.log("asking for all data");

      try {
        const configRepo = AppDataSource.getRepository(Configuration);
        const roleRepo = AppDataSource.getRepository(Role);
        const frequencyRepo = AppDataSource.getRepository(Frequency);
        const roleFrequencyRepo = AppDataSource.getRepository(RoleFrequency);

        const configs = await configRepo.find();
        const roles = await roleRepo.find({
          relations: {
            configuration: true,
          },
        });
        const frequencies = await frequencyRepo.find({});
        const roleFrequencies = await roleFrequencyRepo.find({
          relations: ["role", "frequency"],
        });

        socket.emit("getAllData", {
          configs: configs,
          roles: roles,
          frequencies: frequencies,
          roleFrequencies: roleFrequencies,
        });
      } catch (error) {
        socket.emit("getAllData", { error: error.message });
      }
    });

    socket.on("addRole", async (data) => {
      try {
        const roleRepo = AppDataSource.getRepository(Role);
        const role = roleRepo.create(data);
        const savedRole = await roleRepo.save(role);

        socket.broadcast.emit("addRole", savedRole);
        socket.emit("addRole", savedRole);
      } catch (error) {
        socket.emit("addRole", { error: error.message });
      }
    });

    socket.on("addFrequency", async (data) => {
      try {
        const frequencyRepo = AppDataSource.getRepository(Frequency);
        const frequency = frequencyRepo.create(data);
        const savedFrequency = await frequencyRepo.save(frequency);

        socket.broadcast.emit("addFrequency", savedFrequency);
        socket.emit("addFrequency", savedFrequency);
      } catch (error) {
        socket.emit("addFrequency", { error: error.message });
      }
    });

    socket.on("deleteRole", async (data) => {
      try {
        const roleRepo = AppDataSource.getRepository(Role);
        const role = await roleRepo.findOneBy({ id: data.roleId });
        await roleRepo.remove(role);
        socket.emit("deleteRole", data);
        socket.broadcast.emit("deleteRole", role);
      } catch (error) {
        socket.emit("deleteRole", { error: error.message });
      }
    });

    socket.on("getCurrentConfig", async () => {
      console.log("asking for config");
      try {
        const configRepository = AppDataSource.getRepository(Configuration);
        const roleRepository = AppDataSource.getRepository(Role);

        //Hard coded for now
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

const usersToUserIds = (users: { [key: string]: Socket }) => {
  return Object.keys(users).map((key) => users[key].id);
};

export default socketHandler;
