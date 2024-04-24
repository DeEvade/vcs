import { Server, Socket } from "socket.io";
import { Configuration } from "../database/entities/Configuration";
import { Role } from "../database/entities/Role";
import { DataSource } from "typeorm";


const socketHandler = (io: Server, AppDataSource: DataSource) => {
  const users = {} as { [key: string]: Socket };

  const freq: string[] = [];
  // a hash table where keys are freqs and values are array of user IDs
  const hashMap = new Map<string, string[]>();

  function filterUsers(freq: string[], hashMap: Map<string, string[]>): string[]{
    let usersToTalk: string[] = [];

    freq.forEach((freqKey: string) => {
      if(hashMap.hasOwnProperty(freqKey)){
        usersToTalk = usersToTalk.concat(hashMap.get(freqKey));
      }
    })
    return usersToTalk;
  }

  const usersToTalkTo = filterUsers(freq, hashMap);

  io.on("connection", (socket: Socket) => {
    if(!socket){
      return "there is no socket";
    }
    console.log("a user connected");
    // save all user ids with same frequencies as socket.id in retMap

    if (!users[socket.id]) {
      users[socket.id] = socket;
    }

    socket.on("connectFreq", (freq: string[]) => {
      console.log("connecting to frequency")
      console.log("initial frequency list " + freq);
  
      freq.forEach((freqKey: string) => {
        if(!hashMap.has(freqKey)){
          console.log("if table has not the freq")
          hashMap.set(freqKey, [socket.id]);
        } else {
          console.log("table has the freq")
          if(!hashMap.get(freqKey).includes(socket.id)){
            console.log("table has not user id")
            hashMap.get(freqKey).push(socket.id);
          }
        }
      })
      console.log("second frequency list " + freq);

      socket.on("disconnectFreq", (usersToTalkTo: string[]) => {
        console.log("disconnecting from frequency")
          
        usersToTalkTo.forEach((freqKey: string) => {
          if(hashMap.has(freqKey)){
            let usersInFreq = hashMap.get(freqKey) || [];
            const index = usersInFreq.indexOf(socket.id);
            if(index !== -1){
              usersInFreq.splice(index, 1);
            }
            hashMap.set(freqKey, usersInFreq);
          }
          io.emit("usersToTalkTo", usersToTalkTo);
        })
      })
    
      /*
      const disconnectFromFreq = function (freq: string[], RX: number[], hashMap: Map <string, string[]>) {
        const frequenciesToDisconnect = freq.filter(freq => !RX.includes(Number(freq)))  
        
        frequenciesToDisconnect.forEach((frequency: string) => {
          if(hashMap.has(frequency)){
            let usersInFreq = hashMap.get(frequency) || [];
            if(usersInFreq.includes(socket.id)){
              usersInFreq.forEach(userId => {
                if (userId !== socket.id) {
                  // Destroy signal channel between socketId and userId
                  const peer = model.peers.get(userId);
                  if (peer) {
                    peer.destroy();
                    model.peers.delete(userId);
                  }
                }
              });
            }  
          }    
        }); */
      })
    
      const retMap = new Map<string, string[]>();
      console.log("frequency list before retMap " + freq);
  
      hashMap.forEach((freqValues, freqKey) => {
        console.log("creating retMap and looping over table")
        if(freqValues.includes(socket.id) && freqValues.length > 1){
          console.log("user id is in freqValues")
          retMap.set(freqKey, freqValues.filter((userId) => userId !== socket.id));
        }
      })
      console.log("frequency list after retMap " + freq);
    
    for (const [key, value] of retMap) {
      console.log(`${key}:`, value);
    }

    // For each för att connecta till andra på samma freq
    for(const [freq, userIds] of retMap) {
      if(userIds !== undefined) {
        userIds.forEach((key: string) => {
          console.log("keys: " + key)
          users[key].emit("newUser", socket.id, freq);
        })
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
        if(value.includes(socket.id)){
          console.log("removes user");
          value.splice(value.indexOf(socket.id));
        }
      }
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
  })
}

const usersToUserIds = (users: { [key: string]: Socket }) => {
  return Object.keys(users).map((key) => users[key].id);
};

export default socketHandler;