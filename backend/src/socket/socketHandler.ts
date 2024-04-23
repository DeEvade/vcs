import { Server, Socket } from "socket.io";
import { Configuration } from "../database/entities/Configuration";
import { Role } from "../database/entities/Role";
import { DataSource } from "typeorm";

const socketHandler = (io: Server, AppDataSource: DataSource) => {
  const users = {} as { [key: string]: Socket };

  let freq: string;
  // a hash table where keys are freqs and values are array of user IDs
  const hashTable = new Map<string, string[]>();

  function getFrequencyOfUser(userId: string){
    for(const [freq, userIds] of hashTable){
      if(userIds.includes(userId)){
        return freq;
      }
    }
  }

  // Update the map with new user id (add user in its frequency entries)
  io.on("connectFreq", (freq: string[], socket: Socket) => {
    freq.forEach((freqKey: string) => {
      if(!hashTable.has(freqKey)){
        hashTable.set(freqKey, [socket.id]);
      } else {
        if(!hashTable.get(freqKey).includes(socket.id)){
          hashTable.get(freqKey).push(socket.id);
        }
      }
    })
  })

  io.on("connection", (socket: Socket) => {
    console.log("a user connected");
    // save all user ids with same frequencies as socket.id in retMap
    const retMap = new Map<string, string[]>();

    if (!users[socket.id]) {
      users[socket.id] = socket;
    }
    hashTable.forEach((freqValues, freqKey) => {
        if(freqValues.includes(socket.id)){
          retMap.set(freqKey, freqValues);
        }
      })
    
    /*
    // Array to hold all connected users
    let connectedUsers: string[] = [];
    // Check each entry of map for current user, if exists concatenate
    for(const [freq, userIds] of hashTable) {
      if(userIds.includes(socket.id)) {
        connectedUsers.concat(userIds);
      }
    }
    */

    //Send all users to all users except the one that just connected
    Object.keys(users).forEach((key) => {
      if (key !== socket.id && retMap.has(key)) {
        users[key].emit("newUser", socket.id);
      }
    });

    socket.on("callUser", (data) => {
      const{ userToCall, signalData } = data;

      const callerFreq = getFrequencyOfUser(socket.id);
      const calleeFreq = getFrequencyOfUser(userToCall);

      if(callerFreq != calleeFreq){
        console.log("Callee and caller are not on the same freq")
        return;
      }

      io.to(userToCall).emit("hey", {
        signal: signalData,
        from: socket.id,
      })
      
      /*
      io.to(data.userToCall).emit("hey", {
        signal: data.signalData,
        from: data.from,
      }); */
    });

    socket.on("selectRole&Frequency", (role, freq) => {
      socket.broadcast.emit("selectRole", role);
      socket.broadcast.emit("Frequency", freq);
    })


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
