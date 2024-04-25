import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToOne,
  PrimaryColumn,
  JoinTable,
  Unique,
} from "typeorm";
import { Frequency } from "./Frequency";
import { Role } from "./Role";

@Entity()
@Unique("UQ_role_Frequency", ["roleId", "frequencyId"])
export class RoleFrequency extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  order: number;

  //Default false
  @Column({ default: false })
  isPrimary: boolean;

  @Column()
  roleId: number;
  //Delete cascade

  @Column()
  frequencyId: number;
  //Delete cascade

  @ManyToOne((type) => Role, (role) => role.roleFrequency)
  @JoinTable({ name: "roleId" })
  role: Role;

  @ManyToOne((type) => Frequency, (frequency) => frequency.roleFrequency)
  @JoinTable({ name: "frequencyId" })
  frequency: Frequency;
}
