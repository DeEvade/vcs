import { Socket } from "socket.io";
import { Configuration } from "../database/entities/Configuration";
import { Role } from "../database/entities/Role";
import { DataSource } from "typeorm";
import { Frequency } from "../database/entities/Frequency";

const socketHandler = (socket: Socket, AppDataSource: DataSource) => {
  socket.on("getConfig", async () => {
    console.log("asking for config");

    try {
     // const configRepository = AppDataSource.getRepository(Configuration);
      const freqRepository = AppDataSource.getRepository(Frequency);
      const freqs = await freqRepository.createQueryBuilder("f")
      .leftJoin(Configuration, "c", "f.configuration = c.id")
      .select(["c.name" , "f.frequency"])
      .getRawMany();
      
      //const roles = await roleRepository.find({relations: ["Frequency"]});

      //const configs = await configRepository.find();
      socket.emit("configdata", freqs);
    } catch (error) {
      console.log("Error during default configuration creation", error);
      socket.emit("error", "Failed to fetch configuration data");
    }
  });
};

export default socketHandler;
