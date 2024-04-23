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
} from "typeorm";
import { Frequency } from "./Frequency";
import { Configuration } from "./Configuration";
import { RoleFrequency } from "./RoleFrequency";

@Entity()
export class Role extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: String;

  @Column()
  type: String;

  @Column()
  configurationId: number;

  @ManyToOne((type) => Configuration, (configuration) => configuration)
  @JoinColumn({ name: "configurationId" })
  public configuration: Configuration;

  @OneToMany((type) => RoleFrequency, (roleFrequency) => roleFrequency.role)
  public roleFrequency: RoleFrequency;
}
