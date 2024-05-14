import { Server, Socket } from "socket.io";
import { Configuration } from "../database/entities/Configuration";
import { Role } from "../database/entities/Role";
import { DataSource } from "typeorm";
import { v4 as uuidv4 } from "uuid";
import { Frequency } from "../database/entities/Frequency";
import { RoleFrequency } from "../database/entities/RoleFrequency";
import { XC } from "..//database/entities/XC";

export interface Call {
  id: string;
  initiator: string;
  initiatorRole: string;
  receiver: string;
  receiverRole: string;
  isEmergency: boolean;
}

const socketHandler = async (io: Server, AppDataSource: DataSource) => {
  //Array to store all users connected to the socket
  const users = {} as { [key: string]: Socket };

  //Map to store all cross couplings and the users involved
  const xcConnection = new Map<number, number[]>();

  //Map to store ongoing calls
  const calls = new Map<string, Call>();

  //Map to store the frequencies of each user
  const userToFrequencies = new Map<string, number[]>(); //vanliga hashmapen

  //Map to store amount of users on each frequency
  const countUsersOnFreq = new Map<number, number>();

  let currentConfigId: number = 0;
  //Attempt to retrieve configuration from database
  try {
    const configs = await AppDataSource.getRepository(Configuration).find();
    if (configs.length > 0) {
      currentConfigId = configs[0].id;
    }
  } catch (error) {
    console.log("Error during default configuration creation", error);
  }

  //Attempt to retrieve cross couplings from database
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

  //Main event listener for socket connection
  io.on("connection", (socket: Socket) => {
    //Ensure socket exits
    if (!socket) {
      return "there is no socket";
    }
    // save all user ids with same frequencies as socket.id in retMap
    if (!users[socket.id]) {
      users[socket.id] = socket;
    }

    //Event listener for disconnect that deletes the userId and updates users array
    socket.on("disconnect", () => {
      delete users[socket.id];
      userToFrequencies.delete(socket.id);
      for (const call of calls.values()) {
        if (call.initiator === socket.id || call.receiver === socket.id) {
          calls.delete(call.id);
          io.to(call.initiator).emit("endICCall", call);
          io.to(call.receiver).emit("endICCall", call);
        }
      }
      socket.broadcast.emit("tryDisconnectPeer", socket.id);
    });

    //Event listener to create a call and send an incoming call
    socket.on("ICCall", (data) => {
      data.id = uuidv4();

      for (const call of calls.values()) {
        if (
          (call.initiatorRole === data.initiatorRole &&
            call.receiverRole === data.receiverRole) ||
          (call.receiverRole === data.initiatorRole &&
            call.initiatorRole === data.receiverRole)
        ) {
          socket.emit("IncomingCall", { error: "Call already exists" });
          return;
        }
      }
      socket.broadcast.emit("IncomingCall", data);
    });

    socket.on("getMyReasons", (data: any) => {
      const initiator = socket.id;
      const receiver = data.userId;

      //const initiator = data.userId;
      //const receiver = socket.id;
      const reasons = getReasons(
        initiator,
        userToFrequencies.get(initiator) || [],
        receiver,
        userToFrequencies.get(receiver) || []
      );
      console.log("myReasons: ", socket.id, reasons);

      socket.emit("getMyReasons", {
        userId: data.userId,
        reasons: Array.from(new Set(reasons)),
      });
    });

    socket.on("acceptICCall", (data) => {
      const call = data.call;
      console.log("accepting role data", data);

      console.log("accepting role", call.initiator, call.receiver);

      if (!data.isAccepted) {
        return console.log("call not accepted");
      }

      calls.set(call.id, call);
      console.log("calls", calls);

      io.to(call.initiator).emit("ICCallAccepted", call);
      io.to(call.receiver).emit("ICCallAccepted", call);
      //TODO add reasons
      applyReasons(call.receiver, call.initiator);
      /*io.to(call.initiator).emit("tryConnectPeer", {
        socketId: call.receiver,
        reasons: [],
      });*/

      /*const userId = call.initiator;
      const reasons = getReasons(
        userId,
        userToFrequencies.get(userId) || [],
        call.receiver,
        userToFrequencies.get(call.receiver) || []
      );

      if (reasons.length === 0) {
        //User has no frequencies in common with the updated user
        console.log("no frequencies or calls in common", userId, socket.id);
        users[userId].emit("tryDisconnectPeer", call.receiver);
        socket.emit("tryDisconnectPeer", userId);
        return;
      }
      users[userId].emit("tryConnectPeer", {
        socketId: socket.id,
        reasons: Array.from(new Set(reasons)),
      });

      if (reasons.length === 0) {
        //User has no frequencies in common with the updated user
        console.log("no frequencies in common", userId, call.receiver);
        users[userId].emit("tryDisconnectPeer", call.receiver);
        socket.emit("tryDisconnectPeer", userId);
        return;
      }
      users[userId].emit("tryConnectPeer", {
        socketId: call.receiver,
        reasons: Array.from(new Set(reasons)),
      });*/
    });

    //Event listener to end a call and emit to disconnect the two peers
    socket.on("endICCall", (data) => {
      const call = data;
      console.log("endICCall", data.initiator, data.receiver);
      calls.delete(call.id);
      io.to(data.initiator).emit("endICCall", call);
      io.to(data.receiver).emit("endICCall", call);
      applyReasons(data.initiator, data.receiver);
    });

    const applyReasons = (initiatorId: string, receiverId: string) => {
      const initiator = initiatorId;
      const receiver = receiverId;
      const reasons = getReasons(
        initiator,
        userToFrequencies.get(initiator) || [],
        receiver,
        userToFrequencies.get(receiver) || []
      );

      if (reasons.length === 0) {
        io.to(initiator).emit("tryDisconnectPeer", receiver);
        io.to(receiver).emit("tryDisconnectPeer", initiator);
        return;
      }

      io.to(initiator).emit("tryConnectPeer", {
        socketId: receiver,
        reasons: Array.from(new Set(reasons)),
      });
    };
    //Event listener to create and store in database the new cross coupling

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
        //TODO update the users that are connected
      } catch (error) {
        console.log("error creating XC", error.message);
        socket.emit("createXC", { error: error.message });
      }
    });

    //Event listener to retreive from database the current cross couplings
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

    //Event listener to update database with current information of cross couplings
    socket.on("updateXC", async (data: any) => {
      console.log("updating XC", data);
      //TODO update the connected users in frequencies

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

    //Event listener that manages all changes regarding frequencies
    socket.on("updatedFrequencies", (newFrequencies: number[]) => {
      console.log("updatedFrequencies", userToFrequencies);
      const previousfrequencies = userToFrequencies.get(socket.id) || [];

      userToFrequencies.set(socket.id, newFrequencies);

      //Checks if user has disconnected from a frequency and decrements array by one
      previousfrequencies.forEach((frequency) => {
        if (!newFrequencies.includes(frequency)) {
          if (countUsersOnFreq.has(frequency)) {
            countUsersOnFreq.set(
              frequency,
              countUsersOnFreq.get(frequency) - 1
            );
            const amountdis = countUsersOnFreq.get(frequency);
            console.log(
              "amount of users in freq after disconnect:" + " " + amountdis
            );
          } else {
            countUsersOnFreq.set(frequency, 0);
          }
        }
      });

      //Checks if the user connected to a new frequency and increments array by one
      newFrequencies.forEach((frequency) => {
        if (!previousfrequencies.includes(frequency)) {
          if (countUsersOnFreq.has(frequency)) {
            countUsersOnFreq.set(
              frequency,
              countUsersOnFreq.get(frequency) + 1
            );
            const amount = countUsersOnFreq.get(frequency);
            console.log("amount of users in freq:" + frequency + " " + amount);
          } else {
            countUsersOnFreq.set(frequency, 1);
          }
        }
      });
      const userObject = Object.fromEntries(countUsersOnFreq.entries());
      io.emit("countUsersOnFreq", userObject);

      Object.keys(users).forEach((key) => {
        // Iterate through hashmap
        if (key === socket.id) return;
        applyReasons(socket.id, key);
      });
    });

    const getReasons = (
      initiatorId: string,
      initiatorFrequencies: number[],
      userId: string,
      frequencies: number[]
    ): number[] => {
      console.log(
        "getReasons",
        initiatorId,
        initiatorFrequencies,
        userId,
        frequencies
      );

      const reasons: number[] = [];
      for (const frequency of frequencies) {
        const foundFreq = initiatorFrequencies.find((f) => f === frequency);
        if (foundFreq) {
          reasons.push(frequency);
          // usersToConnect.push(userId);
        }

        xcConnection.forEach((values, key) => {
          values.forEach((value) => {
            if (
              initiatorFrequencies.includes(value) &&
              !reasons.includes(value)
            ) {
              reasons.push(value);
            }
          });
        });
      }
      for (const call of calls.values()) {
        //Check if they have a call
        if (
          (call.initiator === userId && call.receiver === initiatorId) ||
          (call.receiver === userId && call.initiator === initiatorId)
        ) {
          reasons.push(-1);
        }
      }
      console.log("reasons", reasons);

      return reasons;
    };

    //Listens for intialising a call and sends the necessary signaling data to the specified user

    socket.on("callUser", (data) => {
      console.log("calling user", data.userToCall, data.from);
      if (!users[data.userToCall || !users[data.from]]) return;

      const reasons = getReasons(
        data.from,
        userToFrequencies.get(data.from) || [],
        data.userToCall,
        userToFrequencies.get(data.userToCall) || []
      );

      io.to(data.userToCall).emit("hey", {
        signal: data.signalData,
        from: data.from,
        reasons: Array.from(new Set(reasons)),
      });
    });

    //Listens for accepting an incoming call and emits the signal data to establish the connection
    socket.on("acceptCall", (data) => {
      console.log("accepting user", data.to, data.from);

      io.to(data.to).emit("callAccepted", {
        signal: data.signal,
        from: data.from,
      });
    });

    //Listens for the event when a client sets an active configuration
    socket.on("setActiveConfig", async (data) => {
      try {
        const config = await AppDataSource.getRepository(
          Configuration
        ).findOneBy({
          id: data.configId,
        });
        //Updates the current configID and emits the retrived configuration to the client that triggered the event
        if (!config) throw new Error("No configuration found");
        currentConfigId = config.id;
        socket.emit("setActiveConfig", config);
        //Broadcast the retrieved configuration to all connected users
        socket.broadcast.emit("setActiveConfig", config);
      } catch (error) {
        socket.emit("setActiveConfig", { error: error.message });
      }
    });

    //Listens for when a client gets all data and retrieves from the database and emits to the client that triggered the event
    socket.on("getAllData", async () => {
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

    //Listens for when a client adds configuration and updates the database and emits to the client that triggered the event
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

    //Listens for when a client editConfig and updates the database and emit to the client that triggered the event
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

    //Listens for when a client deleteConfig and updates the database and emit to the client that triggered the event
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

    //Event listener that retrives roles, adds a new role and updates the database. Emits back to the client and to all other connected users.
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

    //Event listener that retrives frequency, adds a new frequency and updates the database. Emits back to the client and to all other connected users.
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

    //Event listener that retrieves frequencies, edits and updates the database. Emits back to the client and to all other users
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

    //Event listener that retrieves frequencies, deletes and updates the database. Emits back to the client and to all other users
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

    //Event listener that retrieves roles, deletes and updates the database. Emits back to the client and to all other users
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

    //Event listener that retrieves roles, edits and updates the database. Emits back to the client and to all other users
    socket.on("editRole", async (data) => {
      try {
        const roleRepo = AppDataSource.getRepository(Role);
        const role = await roleRepo.findOneBy({ id: data.roleId });

        role.name = data.name;
        role.type = data.type;
        role.delay = data.delay;

        const savedRole = await roleRepo.save(role);

        socket.emit("editRole", savedRole);
        socket.broadcast.emit("editRole", savedRole);
      } catch (error) {
        socket.emit("editRole", { error: error.message });
      }
    });

    //Listens for the "getCurrentConfig" event triggered by a client to retrieve the current configuration and associated roles from the database.
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

    //Listens for the "deleteRoleFrequency" event triggered by a client to delete a role-frequency relationship from the database.
    socket.on("deleteRoleFrequency", async (data) => {
      try {
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

    //Listens for the "addRoleFrequency" event triggered by a client to add a new role-frequency relationship to the database
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
//Converts an object of users to an array of their corresponding user IDs.
const usersToUserIds = (users: { [key: string]: Socket }) => {
  return Object.keys(users).map((key) => users[key].id);
};

export default socketHandler;
