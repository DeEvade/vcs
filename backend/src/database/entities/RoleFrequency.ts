import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, PrimaryColumn } from "typeorm";
import { Frequency } from "./Frequency";
import { Role } from "./Role";

@Entity()
export class RoleFrequency extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    order: number;

    


    @ManyToOne(type => Role, role => role.roleFrequency) roles: Role;
    @ManyToOne(type => Frequency, frequency => frequency.roleFrequency) frequency: Frequency

}