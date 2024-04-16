import { DataSource } from "typeorm";
import { Configuration } from "../database/entities/Configuration";
import { Frequency } from "../database/entities/Frequency";
import { Role } from "../database/entities/Role"

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number.parseInt(process.env.DB_PORT ?? "5432"),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: true,
  entities: [
    Configuration, Frequency, Role
  ],
  subscribers: [],
  migrations: [],
});
