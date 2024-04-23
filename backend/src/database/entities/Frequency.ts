import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToOne,
  OneToMany,
  JoinTable,
} from "typeorm";
import { Configuration } from "./Configuration";
import { RoleFrequency } from "./RoleFrequency";

@Entity()
export class Frequency extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  frequency: String;

  @Column()
  configurationId: number;

  @ManyToOne(
    (type) => Configuration,
    (configuration) => configuration.frequencies
  )
  @JoinTable({ name: "configurationId" })
  public configuration: Configuration;

  @OneToMany(
    (type) => RoleFrequency,
    (roleFrequency) => roleFrequency.frequency
  )
  roleFrequency: RoleFrequency[];
}
