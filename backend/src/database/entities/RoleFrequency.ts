import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";
import { Frequency } from "./Frequency";
import { Role } from "./Role";

@Entity()
export class RoleFrequency extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  order: number;

<<<<<<< HEAD
    


    @ManyToOne(type => Role, role => role.roleFrequency) roles: Role;
    @ManyToOne(type => Frequency, frequency => frequency.roleFrequency) frequency: Frequency

}
=======
  @ManyToOne((type) => Role, (role) => role.id) role: Role;
  @ManyToOne((type) => Frequency, (frequency) => frequency.id)
  frequency: Frequency;
}
>>>>>>> d1b45bf (frontend update)
