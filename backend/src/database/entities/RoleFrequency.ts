import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne } from "typeorm";
import { Frequency } from "./Frequency";
import { Role } from "./Role";

@Entity()
export class RoleFrequency extends BaseEntity {
    @Column()
    Order: number;


    @ManyToOne(type => Role, role => role.roleFrequency) role: Role;
    @ManyToOne(type => Frequency, frequency => frequency.roleFrequency) frequency: Frequency

}