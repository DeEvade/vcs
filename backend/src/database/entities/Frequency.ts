import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToOne,
  OneToMany,
  JoinTable,
  Unique,
} from "typeorm";
import { Configuration } from "./Configuration";
import { RoleFrequency } from "./RoleFrequency";

@Entity()
@Unique("UQ_frequency_configurationId", ["frequency", "configurationId"])
export class Frequency extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  frequency: String;

  @Column()
  configurationId: number;

  @ManyToOne(
    (type) => Configuration,
    (configuration) => configuration.frequencies,
    { onDelete: "CASCADE" }
  )
  @JoinTable({ name: "configurationId" })
  public configuration: Configuration;

  @OneToMany(
    (type) => RoleFrequency,
    (roleFrequency) => roleFrequency.frequency
  )
  roleFrequency: RoleFrequency[];
}
