import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToMany,
  JoinTable,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Unique,
} from "typeorm";
import { Frequency } from "./Frequency";
import { Configuration } from "./Configuration";
import { RoleFrequency } from "./RoleFrequency";

@Entity()
@Unique("UQ_roleName_configurationId", ["name", "configurationId"])
export class Role extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: String;

  @Column()
  type: String;

  @Column()
  configurationId: number;

  @ManyToOne((type) => Configuration, (configuration) => configuration, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "configurationId" })
  public configuration: Configuration;

  @OneToMany((type) => RoleFrequency, (roleFrequency) => roleFrequency.role)
  public roleFrequency: RoleFrequency;
}
