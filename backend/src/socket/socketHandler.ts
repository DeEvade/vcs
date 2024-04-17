import { Socket } from "socket.io";
import { Configuration } from "../database/entities/Configuration";
import { Role } from "../database/entities/Role";
import { DataSource } from "typeorm";
import { Frequency } from "../database/entities/Frequency";
import { RoleFrequency } from "../database/entities/RoleFrequency";

const socketHandler = (socket: Socket, AppDataSource: DataSource) => {
  socket.on("getCurrentConfig", async () => {
    console.log("asking for config");
    try {
      const configRepository = AppDataSource.getRepository(Configuration);
      const freqRepository = AppDataSource.getRepository(Frequency);
      const roleRepository = AppDataSource.getRepository(Role);
      const roleFreqRepository = AppDataSource.getRepository(RoleFrequency);

      /*const roleFreq = await roleRepository
        .createQueryBuilder("role")
        .leftJoinAndSelect(
          RoleFrequency,
          "roleFrequency",
          "role.id = roleFrequency.role"
        )
        .leftJoinAndSelect(
          Frequency,
          "frequencies",
          "roleFrequency.frequencies = frequencies.id"
        )
        .getRawMany();*/

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
};

export default socketHandler;
