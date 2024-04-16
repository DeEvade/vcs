import { Socket } from "socket.io";
import { Configuration } from "../database/entities/Configuration";
import { Role } from "../database/entities/Role";
import { DataSource } from "typeorm";
import { Frequency } from "../database/entities/Frequency";
import { RoleFrequency } from "../database/entities/RoleFrequency";

const socketHandler = (socket: Socket, AppDataSource: DataSource) => {
  socket.on("getConfig", async () => {
    console.log("asking for config");

    try {
      const configRepository = AppDataSource.getRepository(Configuration);
      //const freqRepository = AppDataSource.getRepository(Frequency);
      
     // const roles = await roleRepository.find({relations: ["Frequency"]});

      const configs = await configRepository.find({relations: {frequencies: {roleFrequency: true }}});
      socket.emit("configdata", configs);
    } catch (error) {
      console.log("Error during default configuration creation", error);
      socket.emit("error", "Failed to fetch configuration data");
    }
  });
};

export default socketHandler;
