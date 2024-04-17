import { DataSource } from "typeorm";
import { Configuration } from "./entities/Configuration";
import { Role } from "./entities/Role";
import { Frequency } from "./entities/Frequency";
import { RoleFrequency } from "./entities/RoleFrequency";

export default async function createDefaultConfig(dataSource: DataSource) {
  const configRepo = dataSource.getRepository(Configuration);
  const roleRepo = dataSource.getRepository(Role);
  const frequencyRepo = dataSource.getRepository(Frequency);
  const roleFrequencyRepo = dataSource.getRepository(RoleFrequency);

  const config = await configRepo.save({ name: "Default config" });

  const ATC1 = await roleRepo.save({
    name: "OS DIR-E",
    type: "ATC",
    configuration: config,
  });
  const ATC2 = await roleRepo.save({
    name: "OS ARR-E",
    type: "ATC",
    configuration: config,
  });
  const ATC3 = await roleRepo.save({
    name: "OS APP-C",
    type: "ATC",
    configuration: config,
  });
  const ATC4 = await roleRepo.save({
    name: "OS P3",
    type: "ATC",
    configuration: config,
  });
  const ATC5 = await roleRepo.save({
    name: "SA TWR W",
    type: "ATC",
    configuration: config,
  });

  const pilot = await roleRepo.save({
    name: "Pilot",
    type: "pilot",
    configuration: config,
  });

  const F1 = await frequencyRepo.save({
    frequency: "118.505",
    configuration: config,
  });
  const F2 = await frequencyRepo.save({
    frequency: "126.655",
    configuration: config,
  });
  const F3 = await frequencyRepo.save({
    frequency: "131.130",
    configuration: config,
  });
  const F4 = await frequencyRepo.save({
    frequency: "120.505",
    configuration: config,
  });

  await roleFrequencyRepo.save({ role: pilot, frequency: F4, order: 1 });
  await roleFrequencyRepo.save({ role: pilot, frequency: F2, order: 2 });
  await roleFrequencyRepo.save({ role: pilot, frequency: F3, order: 3 });
  await roleFrequencyRepo.save({ role: pilot, frequency: F1, order: 4 });


  await roleFrequencyRepo.save({ role: ATC1, frequency: F4, order: 1 });
  await roleFrequencyRepo.save({ role: ATC1, frequency: F2, order: 2 });
  await roleFrequencyRepo.save({ role: ATC1, frequency: F3, order: 3 });
  await roleFrequencyRepo.save({ role: ATC1, frequency: F1, order: 4 });

  await roleFrequencyRepo.save({ role: ATC2, frequency: F2, order: 1 });
  await roleFrequencyRepo.save({ role: ATC2, frequency: F4, order: 2 });
  await roleFrequencyRepo.save({ role: ATC2, frequency: F3, order: 3 });
  await roleFrequencyRepo.save({ role: ATC2, frequency: F1, order: 4 });

  await roleFrequencyRepo.save({ role: ATC3, frequency: F3, order: 2 });
  await roleFrequencyRepo.save({ role: ATC3, frequency: F1, order: 3 });
  await roleFrequencyRepo.save({ role: ATC3, frequency: F4, order: 4 });

  await roleFrequencyRepo.save({ role: ATC4, frequency: F3, order: 1 });
  await roleFrequencyRepo.save({ role: ATC4, frequency: F1, order: 3 });
  await roleFrequencyRepo.save({ role: ATC4, frequency: F4, order: 4 });

  await roleFrequencyRepo.save({ role: ATC5, frequency: F1, order: 1 });
  await roleFrequencyRepo.save({ role: ATC5, frequency: F3, order: 2 });
}

