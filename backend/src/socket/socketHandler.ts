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

  io.on("connection", (socket: Socket) => {
    if(!socket){
      return "there is no socket";
    }
    console.log("a user connected");
    // save all user ids with same frequencies as socket.id in retMap

    if (!users[socket.id]) {
      users[socket.id] = socket;
    }

    //Send all users to all users except the one that just connected
    // Object.keys(users).forEach((key) => {
    //   if (key !== socket.id) {
    //     users[key].emit("newUser", socket.id);
    //   }
    // });

    socket.on("connectFreq", (freq: string[]) => {
      console.log("connecting to frequency")
  
      freq.forEach((freqKey: string) => {
        if(!hashTable.has(freqKey)){
          console.log("if table has not the freq")
          hashTable.set(freqKey, [socket.id]);
        } else {
          console.log("table has the freq")
          if(!hashTable.get(freqKey).includes(socket.id)){
            console.log("table has not user id")
            hashTable.get(freqKey).push(socket.id);
          }
        }
      })
  
      const retMap = new Map<string, string[]>();
  
      hashTable.forEach((freqValues, freqKey) => {
        console.log("creating retMap and looping over table")
        if(freqValues.includes(socket.id) && freqValues.length > 1){
          console.log("user id is in freqValues")
          retMap.set(freqKey, freqValues.filter((userId) => userId !== socket.id));
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

    for (const [key, value] of retMap) {
      console.log(`${key}:`, value);
  }

    // For each för att connecta till andra på samma freq
    for(const [freq, userIds] of retMap) {
      console.log("before loooppppp");
      userIds.forEach((key: string) => {
        console.log("keys: " + key)
        console.log("what the fuck");
        users[key].emit("newUser", socket.id);
      })
    }
  
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
    })

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
