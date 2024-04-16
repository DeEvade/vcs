import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne } from "typeorm";
import { Frequency } from "./Frequency";
import { Role } from "./Role";

@Entity()
export class RoleFrequency extends BaseEntity {
    @Column()
    Order: number;


    @ManyToOne(type => Role, roles => roles.rolefrequency) roles: Role;
    @ManyToOne(type => Frequency, frequencies => frequencies.rolefrequency) frequencies: Frequency

}