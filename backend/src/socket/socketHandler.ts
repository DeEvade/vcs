import { Server, Socket } from "socket.io";
import { Configuration } from "../database/entities/Configuration";
import { Role } from "../database/entities/Role";
import { DataSource } from "typeorm";
import { v4 as uuidv4 } from "uuid";
import { Frequency } from "../database/entities/Frequency";
import { RoleFrequency } from "../database/entities/RoleFrequency";

const socketHandler = async (io: Server, AppDataSource: DataSource) => {
  const users = {} as { [key: string]: Socket };
  let currentConfigId: number = 0;
  try {
    const configs = await AppDataSource.getRepository(Configuration).find();
    if (configs.length > 0) {
      currentConfigId = configs[0].id;
    }
  } catch (error) {
    console.log("Error during default configuration creation", error);
  }

  const freq: string[] = [];
  // a hash table where keys are freqs and values are array of user IDs
  const hashMap = new Map<number, string[]>();

  io.on("connection", (socket: Socket) => {
    if (!socket) {
      return "there is no socket";
    }
    console.log("a user connected");
    // save all user ids with same frequencies as socket.id in retMap

    if (!users[socket.id]) {
      users[socket.id] = socket;
    }

    socket.on("connectFreq", (freq: number[]) => {
      console.log("connecting to frequency");
      console.log("initial frequency list " + freq);

      freq.forEach((freqKey: number) => {
        if (!hashMap.has(freqKey)) {
          console.log("if table has not the freq");
          hashMap.set(freqKey, [socket.id]);
        } else {
          console.log("table has the freq");
          if (!hashMap.get(freqKey).includes(socket.id)) {
            console.log("table has not user id");
            hashMap.get(freqKey).push(socket.id);
          }
        }
      });

      socket.on("disconnectFreq", (NORX: number[]) => {
        console.log("NORX" + "" + NORX);
        hashMap.forEach((value, key) => {
          console.log("before updating map" + `${key}: ${value}`);
        });

        let userId = uuidv4();

        NORX.forEach((freqKey: number) => {
          if (hashMap.has(freqKey)) {
            const users = hashMap.get(freqKey);
            if (users.includes(socket.id)) {
              const temp = users.filter((user) => user !== socket.id);
              console.log("temp" + "" + temp);
              hashMap.set(freqKey, temp);
              hashMap.forEach((value, key) => {
                console.log("updated map" + `${key}: ${value}`);
              });

              io.emit("peerDisconnect", socket.id);
              console.log("We have emitted peerDisconnect");
            } else {
              return;
            }
          }
        });
        io.emit("reconnect", userId);
      });

      console.log("second frequency list " + freq);

      const retMap = new Map<number, string[]>();
      console.log("frequency list before retMap " + freq);

      hashMap.forEach((freqValues, freqKey) => {
        console.log("creating retMap and looping over table");
        if (freqValues.includes(socket.id) && freqValues.length > 1) {
          console.log("user id is in freqValues ");
          retMap.set(
            freqKey,
            freqValues.filter((userId) => userId !== socket.id)
          );
        }
      });
      console.log("frequency list after retMap " + freq);

      for (const [key, value] of retMap) {
        console.log(`${key}:`, value);
      }

      // For each för att connecta till andra på samma freq
      for (const [freq, userIds] of retMap) {
        if (userIds !== undefined) {
          userIds.forEach((key: string) => {
            console.log("keys: " + key);
            users[key]?.emit("newUser", socket.id);
          });
        }
      }

      socket.on("callUser", (data) => {
        io.to(data.userToCall).emit("hey", {
          signal: data.signalData,
          from: data.from,
        });
      });

      socket.on("disconnect", () => {
        console.log("user disconnected");
        delete users[socket.id];

        // Remove user from all mentions in map
        for (const [key, value] of hashMap.entries()) {
          if (value.includes(socket.id)) {
            console.log("removes user");
            value.splice(value.indexOf(socket.id));
          }
        }
      });

      socket.on("acceptCall", (data) => {
        io.to(data.to).emit("callAccepted", {
          signal: data.signal,
          from: data.from,
        });
      });
    });

    socket.on("setActiveConfig", async (data) => {
      try {
        const config = await AppDataSource.getRepository(
          Configuration
        ).findOneBy({
          id: data.configId,
        });
        if (!config) throw new Error("No configuration found");
        currentConfigId = config.id;
        socket.emit("setActiveConfig", config);
        socket.broadcast.emit("setActiveConfig", config);
      } catch (error) {
        socket.emit("setActiveConfig", { error: error.message });
      }
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
          activeConfigId: currentConfigId,
        });
      } catch (error) {
        socket.emit("getAllData", { error: error.message });
      }
    });

    socket.on("addConfig", async (data) => {
      try {
        const configRepo = AppDataSource.getRepository(Configuration);
        const config = configRepo.create(data);
        const savedConfig = await configRepo.save(config);

        socket.broadcast.emit("addConfig", savedConfig);
        socket.emit("addConfig", savedConfig);
      } catch (error) {
        socket.emit("addConfig", { error: error.message });
      }
    });

    socket.on("editConfig", async (data) => {
      try {
        const configRepo = AppDataSource.getRepository(Configuration);
        const config = await configRepo.findOneBy({ id: data.id });
        config.name = data.name;
        const savedConfig = await configRepo.save(config);

        socket.emit("editConfig", config);
        socket.broadcast.emit("editConfig", config);
      } catch (error) {
        socket.emit("editConfig", { error: error.message });
      }
    });

    socket.on("deleteConfig", async (data) => {
      try {
        const configRepo = AppDataSource.getRepository(Configuration);
        const config = await configRepo.findOneBy({ id: data.id });
        const tmp = { ...config };
        await configRepo.remove(config);
        socket.emit("deleteConfig", tmp);
        socket.broadcast.emit("deleteConfig", tmp);
      } catch (error) {
        socket.emit("deleteConfig", { error: error.message });
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

    socket.on("editFrequency", async (data) => {
      try {
        const frequencyRepo = AppDataSource.getRepository(Frequency);
        const frequency = await frequencyRepo.findOneBy({
          id: data.frequencyId,
        });
        frequency.frequency = data.frequency;
        const savedFrequency = await frequencyRepo.save(frequency);

        socket.emit("editFrequency", savedFrequency);
        socket.broadcast.emit("editFrequency", savedFrequency);
      } catch (error) {
        socket.emit("editFrequency", { error: error.message });
      }
    });

    socket.on("deleteFrequency", async (data) => {
      try {
        const frequencyRepo = AppDataSource.getRepository(Frequency);
        const frequency = await frequencyRepo.findOneBy({
          id: data.frequencyId,
        });
        const tmp = { ...frequency };
        await frequencyRepo.remove(frequency);
        socket.emit("deleteFrequency", tmp);
        socket.broadcast.emit("deleteFrequency", tmp);
      } catch (error) {
        socket.emit("deleteFrequency", { error: error.message });
      }
    });

    socket.on("deleteRole", async (data) => {
      try {
        const roleRepo = AppDataSource.getRepository(Role);
        const role = await roleRepo.findOneBy({ id: data.roleId });
        const tmp = { ...role };
        await roleRepo.remove(role);
        socket.emit("deleteRole", tmp);
        socket.broadcast.emit("deleteRole", tmp);
      } catch (error) {
        socket.emit("deleteRole", { error: error.message });
      }
    });

    socket.on("editRole", async (data) => {
      try {
        const roleRepo = AppDataSource.getRepository(Role);
        const role = await roleRepo.findOneBy({ id: data.roleId });

        role.name = data.name;
        role.type = data.type;

        const savedRole = await roleRepo.save(role);

        socket.emit("editRole", savedRole);
        socket.broadcast.emit("editRole", savedRole);
      } catch (error) {
        socket.emit("editRole", { error: error.message });
      }
    });

    socket.on("getCurrentConfig", async () => {
      console.log("asking for config");
      try {
        const configRepository = AppDataSource.getRepository(Configuration);
        const roleRepository = AppDataSource.getRepository(Role);

        const config = await configRepository.findOneBy({
          id: currentConfigId,
        });

        const roles = await roleRepository.find({
          relations: { roleFrequency: { frequency: true } },
          where: { configuration: { id: currentConfigId } },
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

    socket.on("deleteRoleFrequency", async (data) => {
      try {
        console.log("deleting role frequency", data);

        const roleFrequencyRepo = AppDataSource.getRepository(RoleFrequency);
        const roleFrequency = await roleFrequencyRepo.findOneBy({
          roleId: data.roleId,
          frequencyId: data.frequencyId,
        });
        const tmp = { ...roleFrequency };
        await roleFrequencyRepo.remove(roleFrequency);
        socket.emit("deleteRoleFrequency", tmp);
        socket.broadcast.emit("deleteRoleFrequency", tmp);
      } catch (error) {
        socket.emit("deleteRoleFrequency", { error: error.message });
      }
    });

    socket.on("addRoleFrequency", async (data) => {
      try {
        const roleFrequencyRepo = AppDataSource.getRepository(RoleFrequency);
        data.order = 1;
        const roleFrequency = roleFrequencyRepo.create(data);
        const savedRoleFrequency = await roleFrequencyRepo.save(roleFrequency);
        const roleFrequencyWithRelation = await roleFrequencyRepo.findOne({
          relations: ["role", "frequency"],
          where: {
            frequencyId: data.frequencyId,
            roleId: data.roleId,
          },
        });

        socket.emit("addRoleFrequency", roleFrequencyWithRelation);
        socket.broadcast.emit("addRoleFrequency", roleFrequencyWithRelation);
      } catch (error) {
        socket.emit("addRoleFrequency", { error: error.message });
      }
    });
  });
};

const usersToUserIds = (users: { [key: string]: Socket }) => {
  return Object.keys(users).map((key) => users[key].id);
};

export default socketHandler;
