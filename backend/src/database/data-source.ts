import { DataSource } from "typeorm";
import { Configuration } from "../database/entities/Configuration";
import { Frequency } from "../database/entities/Frequency";
import { Role } from "../database/entities/Role";
import { RoleFrequency } from "./entities/RoleFrequency";
import { XC } from "./entities/XC";
import dotenv from "dotenv";
dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.POSTGRES_HOST || process.env.DB_HOST || "localhost",
  port: Number.parseInt(process.env.DB_PORT ?? "5432"),
  username: process.env.POSTGRES_USER || process.env.DB_USERNAME || "postgres",
  password:
    process.env.POSTGRES_PASSWORD || process.env.DB_PASSWORD || "password",
  database: process.env.POSTGRES_DATABASE || process.env.DB_NAME || "vcs",
  synchronize: true,
  logging: true,
  entities: [Configuration, Frequency, Role, RoleFrequency, XC],
  subscribers: [],
  migrations: [],
  ssl: true,
  extra: {
    ssl: {
      rejectUnauthorized: false,
    },
  },
});
