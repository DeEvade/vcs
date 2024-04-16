import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Configuration } from "./Configuration";
import { RoleFrequency } from "./RoleFrequency";

@Entity()
export class Frequency extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  frequency: String;

  @ManyToOne(
    (type) => Configuration,
    (configuration) => configuration.frequencies
  )
  configuration: Configuration;
  @OneToMany(
    (type) => RoleFrequency,
    (roleFrequency) => roleFrequency.frequency
  )
  roleFrequency: RoleFrequency[];
}
