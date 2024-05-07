import { Server, Socket } from "socket.io";
import { Configuration } from "../database/entities/Configuration";
import { Role } from "../database/entities/Role";
import { DataSource } from "typeorm";
import { v4 as uuidv4 } from "uuid";
import { Frequency } from "../database/entities/Frequency";
import { RoleFrequency } from "../database/entities/RoleFrequency";
import { XC } from "..//database/entities/XC";

const socketHandler = async (io: Server, AppDataSource: DataSource) => {
  const users = {} as { [key: string]: Socket };

  const xcConnection = new Map<number, number[]>();

  //Hashmap to store the frequencies of each user
  const userToFrequencies = new Map<string, number[]>(); //vanliga hashmapen
  // keys are frequencies and values are count of users on the frequency
  const countUsersOnFreq = new Map<number, number>();


  // User tupple to freq
  const usersAtFreq = new Map<string, number>();

  let currentConfigId: number = 0;
  try {
    const configs = await AppDataSource.getRepository(Configuration).find();
    if (configs.length > 0) {
      currentConfigId = configs[0].id;
    }
  } catch (error) {
    console.log("Error during default configuration creation", error);
  }

  try {
    const XCRepo = AppDataSource.getRepository(XC);
    const xcs = await XCRepo.find();
    if (xcs.length > 0) {
      xcs.forEach((xc) => {
        xcConnection.set(xc.id, xc.frequencyIds);
      });
    }
  } catch (error) {
    console.log("Error getting XC", error);
  }

  io.on("connection", (socket: Socket) => {
    if (!socket) {
      return "there is no socket";
    }
    console.log("a user connected");
    // save all user ids with same frequencies as socket.id in retMap

    if (!users[socket.id]) {
      users[socket.id] = socket;
    }
    socket.on("disconnect", () => {
      delete users[socket.id];
      userToFrequencies.delete(socket.id);
      socket.broadcast.emit("tryDisconnectPeer", socket.id);
    });

    socket.on("createXC", async (data: any) => {
      console.log("creating XC", data);
      try {
        const noDuplicates = Array.from(new Set(data.frequencyIds)) as number[];
        const XCRepo = AppDataSource.getRepository(XC);
        const xc = XCRepo.create({ frequencyIds: noDuplicates });
        if (noDuplicates.length < 2)
          throw new Error("XC must have at least 2 frequencies");

        const savedXC = await XCRepo.save(xc);
        if (!savedXC) throw new Error("Error saving XC");
        xcConnection.set(savedXC.id, savedXC.frequencyIds);
        socket.emit("createXC", savedXC);
        socket.broadcast.emit("createXC", savedXC);
      } catch (error) {
        console.log("error creating XC", error.message);
        socket.emit("createXC", { error: error.message });
      }
    });

    socket.on("getCurrentXC", async () => {
      try {
        socket.emit(
          "getCurrentXC",
          Array.from(xcConnection).map(([id, frequencies]) => ({
            id,
            frequencyIds: frequencies,
          }))
        );
      } catch (error) {
        socket.emit("getCurrentXC", { error: error.message });
        console.log("error getting XC", error.message);
      }
    });

    socket.on("updateXC", async (data: any) => {
      console.log("updating XC", data);

      try {
        const noDuplicates = Array.from(new Set(data.frequencyIds)) as number[];

        const XCRepo = AppDataSource.getRepository(XC);
        if (noDuplicates.length < 2) {
          xcConnection.delete(data.id);
          await XCRepo.delete(data.id);
          socket.broadcast.emit("deleteXC", data);
          socket.emit("deleteXC", data);
          console.log("deleted XC", data);
          return;
        }
        const xc = await XCRepo.findOneBy({ id: data.id });
        if (!xc) throw new Error("Error getting XC");
        xc.frequencyIds = noDuplicates;
        const savedXC = await XCRepo.save(xc);
        if (!savedXC) throw new Error("Error saving XC");
        xcConnection.set(savedXC.id, savedXC.frequencyIds);
        socket.broadcast.emit("updateXC", savedXC);
        socket.emit("updateXC", savedXC);
      } catch (error) {
        socket.emit("updateXC", { error: error.message });
      }
    });

    socket.on("updatedFrequencies", (newFrequencies: number[]) => {
      console.log("updatedFrequencies", userToFrequencies);
      const previousfrequencies = userToFrequencies.get(socket.id) || [];

      userToFrequencies.set(socket.id, newFrequencies);

      previousfrequencies.forEach((frequency) => {
        if(!newFrequencies.includes(frequency)){
          if(countUsersOnFreq.has(frequency)){
            countUsersOnFreq.set(frequency, countUsersOnFreq.get(frequency) - 1);
            const amountdis = countUsersOnFreq.get(frequency);
            console.log("amount of users in freq after disconnect:" + " " + amountdis);
          } else {
            countUsersOnFreq.set(frequency, 0);
          }
        }
      })

      newFrequencies.forEach((frequency) => {
        if(!previousfrequencies.includes(frequency)){
          if(countUsersOnFreq.has(frequency)){
            countUsersOnFreq.set(frequency, countUsersOnFreq.get(frequency) + 1);
            const amount = countUsersOnFreq.get(frequency);
            console.log("amount of users in freq:" + frequency + " " + amount);
          } else {
            countUsersOnFreq.set(frequency, 1);
          }
        }
      })
      const userObject = Object.fromEntries(countUsersOnFreq.entries());
      io.emit("countUsersOnFreq", userObject);
      const usersToConnect: string[] = [];

      Object.keys(users).forEach((key) => {
        //Går igenom hashmapen
        if (key === socket.id) return;
        userToFrequencies.forEach((frequencies, userId) => {
          if (userId === socket.id) return;
          for (const frequency of frequencies) {
            if (newFrequencies.includes(frequency)) {
              usersToConnect.push(userId);
              usersAtFreq.set(socket.id + userId, frequency);
              console.log("TESTING EARLIER FREQ: " + usersAtFreq.get(socket.id + userId))
              return;
            }
            xcConnection.forEach((values, key) => {
              if (
                values.includes(frequency) &&
                values.some((value) => newFrequencies.includes(value))
              ) {
                usersToConnect.push(userId);
                return;
              }
            });
          }
          //User has no frequencies in common with the updated user
          console.log("no frequencies in common", userId, socket.id);
          users[userId].emit("tryDisconnectPeer", socket.id);
          socket.emit("tryDisconnectPeer", userId);
        });

        //users[key].emit('sending to', usersArray);
      });
      console.log("action user: " + socket.id);

      console.log("users to connect", usersToConnect);
      //remove dupliactes
      const uniqueUsersToConnect = Array.from(new Set(usersToConnect));
      uniqueUsersToConnect.forEach((userId) => {
        let freq = usersAtFreq.get(socket.id + userId);
        console.log("TESTING FREQ: " + freq);
        users[userId].emit("tryConnectPeer", socket.id, freq);
      });
    });

    socket.on("callUser", (data, freq) => {
      console.log("calling user", data.userToCall, data.from);

      io.to(data.userToCall).emit("hey", {
        signal: data.signalData,
        from: data.from,
      });
    });

    socket.on("acceptCall", (data) => {
      console.log("accepting user", data.to, data.from);

      io.to(data.to).emit("callAccepted", {
        signal: data.signal,
        from: data.from,
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
  })
}
const usersToUserIds = (users: { [key: string]: Socket }) => {
  return Object.keys(users).map((key) => users[key].id);
};

export default socketHandler;
