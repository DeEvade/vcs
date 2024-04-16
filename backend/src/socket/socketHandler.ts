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
      const freqRepository = AppDataSource.getRepository(Frequency);
      const roleRepository = AppDataSource.getRepository(Role);
      const roleFreqRepository = AppDataSource.getRepository(RoleFrequency);

      const roleFreq = await roleRepository
        .createQueryBuilder("role")
        .innerJoin(
          RoleFrequency,
          "roleFrequency",
          "role.id = roleFrequency.roles"
        )
        .innerJoin(
          Frequency,
          "frequencies",
          "roleFrequency.frequencies = frequencies.id"
        )
        .getRawMany();

      socket.emit("configdata", roleFreq);
    } catch (error) {
      console.log("Error during default configuration creation", error);
      socket.emit("error", "Failed to fetch configuration data");
    }
  });
};

export default socketHandler;
