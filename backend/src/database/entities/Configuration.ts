import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  OneToMany,
  JoinTable,
  Unique,
} from "typeorm";
import { Frequency } from "./Frequency";
import { Role } from "./Role";

@Entity()
export class Configuration extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Unique(["name"])
  name: string;

  @OneToMany((type) => Frequency, (frequency) => frequency.configuration)
  frequencies: Frequency[];

  @OneToMany((type) => Role, (role) => role.configuration)
  roles: Role[];
}
